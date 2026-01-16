import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { UsuarioService } from './usuario.service';
import { AuthService } from '../guard/auth.service';

declare var bootstrap: any;

/**
 * @description
 * Component responsible for managing users.
 * Handles user listing, filtering, creation, update, deletion,
 * and Bootstrap modal lifecycle management.
 */
@Component({
  selector: 'usuario',
  imports: [NgSelectModule, CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, AfterViewInit, OnDestroy {

  


  // ==========================================================================
  // VARIABLES
  // ===========================================================================

  /** @description List of users retrieved from the backend. */
  users: any[] = [];

  /** @description Selected user for delete or detail operations. */
  userSelected = {
    id: '',
    name: '',
    correo: '',
    role: '',
    estado: ''
  };

  /** @description Selected user data for edit operations. */
  userSelectedEdit = {
    id: '',
    name: '',
    correo: '',
    role: '',
    estado: '',
    vicepresidencia: ''
  };

  /** @description Data model for creating a new user. */
  nuevoUsuario: any = {
    name: '',
    correo: '',
    role: '',
    estado: '',
    vicepresidencia: ''
  };

  /** @description Records associated with a specific user. */
  radicadosUsuario: any[] = [];




  // =============================================================================
  // FILTERS
  // ============================================================================

  /** @description Filter by user role. */
  roleFiltro: string = '';

  /** @description Filter by user status. */
  estadoFiltro: string = '';

  /** @description Text search filter. */
  busqueda: string = '';

  /** @description Date filter value. */
  fechaFiltro: string = '';


  /**
   * @description
   * Returns users filtered by role, status and search input.
   * @returns Filtered list of users.
   */
  get usersFiltrado() {
    return this.users.filter((r) => {
      const coincideEstado = this.estadoFiltro ? r.estado === this.estadoFiltro : true;
      const coincideRole = this.roleFiltro ? r.role === this.roleFiltro : true;
      const coincideBusqueda = this.busqueda
        ? (
            r.correo?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
            r.name.toLowerCase().includes(this.busqueda.toLowerCase())
          )
        : true;

      return coincideEstado && coincideRole && coincideBusqueda;
    });
  }


  
  
  // ==============================================================================
  // LYFECYCLE HOOKS
  // ===============================================================================

  /**
   * @description
   * Creates an instance of UsuarioComponent.
   * @param authService Authentication and authorization service.
   * @param usuarioService Service for user-related API operations.
   */
  constructor(
    public authService: AuthService,
    private usuarioService: UsuarioService
  ) {}


  /**
   * @description
   * Runs once the component is initialized.
   * Loads all users from the backend.
   */
  ngOnInit(): void {
    this.getAllUsers();
  }

  /**
   * @description
   * Runs after the component view is initialized.
   * Attaches Bootstrap modal close listeners.
   */
  ngAfterViewInit() {
    const ids = [
      'modalEliminar',
      'modalDetalles',
      'modalEditar',
      'modalAgregar'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('hidden.bs.modal', this.handleModalClose);
      }
    });
  }

  /**
   * @description
   * Runs when the component is destroyed.
   * Removes Bootstrap modal listeners to prevent memory leaks.
   */
  ngOnDestroy() {
    const ids = [
      'modalEliminar',
      'modalDetalles',
      'modalEditar',
      'modalAgregar'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.removeEventListener('hidden.bs.modal', this.handleModalClose);
      }
    });
  }





  // =============================================================================
  // MODAL HELPERS
  // ============================================================================

  /** @description Indicates whether initial data is loading. */
  cargando: boolean = true;


  /** @description Signal representing loading state for async actions. */
  isLoading = signal(false);


  /** @description Signal storing success or error messages. */
  successMessage = signal<string | null>(null);


  /**
   * @description
   * Executed when any Bootstrap modal is closed.
   */
  handleModalClose = () => {
    this.reiniciarModal();
  };


  /**
   * @description
   * Resets modal UI state.
   */
  reiniciarModal = () => {
    this.successMessage.set(null);
    this.isLoading.set(false);
  };


  /**
   * @description
   * Opens a Bootstrap modal by its DOM id.
   * @param targetId Modal element id.
   */
  abrirOtroModal(targetId: string) {
    const nuevoModal = new bootstrap.Modal(document.getElementById(targetId));
    nuevoModal.show();
  }


  /**
   * @description
   * Opens the delete confirmation modal.
   * @param user User selected for deletion.
   */
  abrirModalEliminar(user: any) {
    this.userSelected = user;
    const nuevoModal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    nuevoModal.show();
  }


  /**
   * @description
   * Opens the edit modal and loads user data.
   * @param user User selected for editing.
   */
  abrirModalEditar(user: any) {
    this.userSelectedEdit = { ...user };
    const nuevoModal = new bootstrap.Modal(document.getElementById('modalEditar'));
    nuevoModal.show();
  }

  

  
  // ==============================================================================
  // USERS DATA
  //================================================================================

  /**
   * @description
   * Retrieves all users and formats date fields.
   */
  getAllUsers() {
    this.usuarioService.getAllUsers().subscribe({
      next: (dat) => {
        this.users = dat.data.map((r: any) => {
          const seconds = Number(r.createdAt?._seconds);
          const millis = seconds ? seconds * 1000 : null;
          const fecha = millis ? new Date(millis) : null;

          return {
            ...r,
            fechaRadicacion: fecha
              ? fecha.toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Sin fecha',
            fechaRadicacionISO: fecha
              ? new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split('T')[0]
              : null,
          };
        });

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error obtaining all information user', err)
        this.cargando = false;
      }
    });
  }




  // =================================================================================
  // REQUEST FOR USER
  // ===============================================================================

  /**
   * @description
   * Deletes a user by id.
   * @param userId User identifier.
   */
  eliminateUser(userId: string) {
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.usuarioService.eliminateUser(userId).subscribe({
      next: () => {
        this.successMessage.set('¡Eliminación del usuario completada!');
        this.isLoading.set(false);

        setTimeout(() => window.location.reload(), 2000);
      },
      error: (err) => {
        
        this.successMessage.set('Error: No se pudo enviar la solicitud. ');
        this.isLoading.set(false);
         console.error('Error eliminating an user', err)
      }
    });
  }

  /**
   * @description Updates an existing user.
   */
  updateUser() {
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.usuarioService.updateUser(this.userSelectedEdit).subscribe({
      next: () => {
        this.successMessage.set('¡Solicitud enviada correctamente!');
        this.isLoading.set(false);

        this.userSelectedEdit = {
          id: '',
          name: '',
          correo: '',
          role: '',
          estado: '',
          vicepresidencia: ''
        };

        setTimeout(() => window.location.reload(), 2000);
      },
      error: (err) => {
        this.successMessage.set('Error: No se pudo enviar la solicitud. ');
        this.isLoading.set(false);
         console.error('Error updating an user', err)
      }
    });
  }

  /**
   * @description Creates a new user.
   */
  guardarNuevoUsuario() {
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.successMessage.set('¡Solicitud enviada correctamente!');
        this.isLoading.set(false);

        this.nuevoUsuario = {
          name: '',
          correo: '',
          role: 'User',
          estado: 'Creado',
          vicepresidencia: ''
        };

        setTimeout(() => window.location.reload(), 2000);
      },
      error: (err) => {
        this.successMessage.set('Error: No se pudo enviar la solicitud. ');
        this.isLoading.set(false);
         console.error('Error crating a new user', err)
      }
    });
  }



  // ==================================================================================
  // PTHERS
  // =================================================================================

  /**
   * @description Shows user details.
   * @param id User identifier.
   */
  mostrarDetalles(id: any) {}

  /**
   * @description
   * user logout of the session.
   * Automatically redirect to the login page view
   */
  logout() {}
}
