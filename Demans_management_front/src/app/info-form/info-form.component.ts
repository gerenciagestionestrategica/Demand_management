import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoFormService } from './info-form.service';
import { AuthService } from '../guard/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'info-form',
  imports: [FormsModule, CommonModule, CurrencyPipe],
  templateUrl: './info-form.component.html',
  styleUrl: './info-form.component.css'
})
export class InfoFormComponent implements OnInit {

  constructor(private infoFormService: InfoFormService, public authService: AuthService, private router: Router) {}

  
  /**
  * @description
  * list of the tribes
  */
  tribus: string[] = [];


  /**
  * @description
  * list of the vp sponsor
  */
  sponsors: string[] = [];


  /**
  * @description
  * list of the squads
  */
  squads: string[] = [];


  /**
  * @description
  * value of the minimun salary
  */
  minimumSalary: number = 0;


  /**
  * @description
  *  minimum cutting quantity
  */
 minimumCuttingQuantity: number = 0;


  /**
  * @description
  * Input value with the name of the new tribu
  */
  newTribu = '';


  /**
  * @description
  * Input value with the name of the new vp sponsor
  */
  newSponsor = '';


  /**
  * @description
  * Input value with the name of the new squad
  */
  newSquad = '';


  /**
  * @description
  * /**
  * @description
  * Input value with the number of the new salary to update
  */
  newSalary!: number;



  /**
  * @description
  * Input value with the number of the new minimum cutting quantity to update
  */
  newMinumumCuttingQuantity!: number;


  /**
  * @description
  * list of Vicerpesidents Aprovers
  */
  vicepresidentAprovers: string[] = [];

  /**
  * @description
  * list of options for Vicerpesidents Aprovers
  */
  listOptionsVicepresidentAprovers: string[] = [];


  /**
  * @description
  * Input value with the number of the new salary to update
  */
  newVicepresident: string = "";

  /**
  * @description
  *  Vicerpesidents Aprovers Backup
  */
  vicepresidentAproversBackup: string = '';

  /**
  * @description
  * list of options for Vicerpesidents Aprovers Backup
  */
  listOptionsVicepresidentAproversBackup: string[] = [];

  
  /**
  * @description
  * Input value with the number of the new salary to update
  */
  newVicepresidentBackup: string ="";




  /**
  * @description
  * Control the view of the page with a loading animate
  */
  isLoading: boolean = true;


  /**
   * @description
   * Angular life-cycle angular. Runs when the component is initialized and load the information of the program.
   */
  ngOnInit(): void {
    this.getInfoForm();
    
  }

  
  /**
  * @description
  * Get the information that the program use and save in the corresponding variable
  */
  getInfoForm() {

    this.infoFormService.getInfoForm().subscribe({
      
      next: (data) => {
        this.isLoading = false;
        this.tribus = data.tribus;
        this.sponsors = data.vpSponsors;
        this.squads = data.squads;
    
        this.minimumSalary = data.salario;
        this.minimumCuttingQuantity=data.monto_corte;

        this.vicepresidentAprovers=data.viceAprovers
        this.vicepresidentAproversBackup = data.viceAproversBackup[0]
        this.listOptionsVicepresidentAprovers = data.OptionVicesAprovers
        this.listOptionsVicepresidentAproversBackup = data.OptionVicesAproversBackup
        
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error to obtaing the information of the draft', err);
      }
    });
  }

  // =====================================================================================
  //   REQUEST - TRIBUS
  // =====================================================================================

  /**
  * @description
  * add a new tribu in the data that will appear in the form and the edit form page.
  */
  addTribu() {
    if (this.newTribu.trim()) {
      this.infoFormService.createTribu(this.newTribu).subscribe({
        next: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (err) => {
          console.error('Error in adding of a new tribu', err);
        }
      });

      this.newTribu = '';
    }
  }

  /**
  * @description
  * Eliminate the tribu in the base data that will be delete in the form and the edit form page.
  */
  eliminateTribu(i: number) {
    const nameTribu = this.tribus[i];

    this.infoFormService.eliminateTribu(nameTribu).subscribe({
      next: () => {
        setTimeout(() => window.location.reload(), 1000);
      },
      error: (err) => {
        console.error('Error in eliminating of a tribu:', err);
      }
    });
  }

 
  // =====================================================================================
  //   REQUEST - VP SPONSOR
  // =====================================================================================  
  

  /**
  * @description
  * Add a new Vp sponsor in the base data that will appear in the form and the edit form page.
  */
  addSponsor() {
    if (this.newSponsor.trim()) {
      this.infoFormService.createVpSponsor(this.newSponsor).subscribe({
        next: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (err) => {
          console.error('Error in adding of a new vp sponsor:', err);
        }
      });

      this.newSquad = ''; // Nota: esto parece un error lógico, pero no lo modifico.
    }
  }

  /**
  * @description
  * Eliminate a  Vp sponsor in the base data that will be delete in the form and the edit form page.
  */
  eliminateSponsor(i: number) {
    const nameSponsor = this.sponsors[i];

    this.infoFormService.eliminateVpSponsor(nameSponsor).subscribe({
      next: () => {
        setTimeout(() => window.location.reload(), 1000);
      },
      error: (err) => {
        console.error('Error in eliminating of a vp sponsor:', err);
      }
    });
  }

  
  // =====================================================================================
  //   REQUEST - SQUADS
  // =====================================================================================

  /**
  * @description
  * Add a new Squad in the base data that will appear in the form and the edit form page.
  */
  addSquad() {
    if (this.newSquad.trim()) {
      this.infoFormService.createSquad(this.newSquad).subscribe({
        next: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (err) => {
          console.error('Error in adding of a new vp squad:', err);
        }
      });

      this.newSquad = '';
    }
  }


  /**
  * @description
  * Delete a Squad in the base data that will be delete in the form and the edit form page.
  */
  eliminateSquad(i: number) {
    const nameSquad = this.squads[i];

    this.infoFormService.eliminateSquad(nameSquad).subscribe({
      next: () => {
        setTimeout(() => window.location.reload(), 1000);
      },
      error: (err) => {
        console.error('Error in eliminating of a squad:', err);
      }
    });
  }

 
  // =====================================================================================
  //   REQUEST - MINIMUM SALARY
  // =====================================================================================

  /**
  * @description
  * Update de amount of the minimum legal salary.
  */
  updateSalary() {
    if (this.newSalary > 0) {
      this.infoFormService.newSalary(this.newSalary).subscribe({
        next: () => {
          
          setTimeout(() => window.location.reload(), 100);
        },
        error: (err) => {
          console.error('Error updating Salary:', err);
        }
      });
    }
  }

  // =====================================================================================
  //   MINUMUM CUTTING QUANTITY
  // =====================================================================================

  /**
  * @description
  * Update de amount of the mimimum cutting quantity.
  */
  updateMinimumCuttingQuantity(){

    if (this.newMinumumCuttingQuantity > 0) {
      this.infoFormService.newMinimumCuttingQuantity(this.newMinumumCuttingQuantity).subscribe({
        next: () => {
          
          setTimeout(() => window.location.reload(), 100);
        },
        error: (err) => {
          console.error('Error updating the mimimum cutting quantity:', err);
        }
      });
    }

  }

  // =====================================================================================
  //   VICEPRESIDENT BACKUP
  // =====================================================================================

  /**
  * @description
  * Update the backup Vicepresident
  */
  updateVicepresidentBackup() {
  
      this.infoFormService.updateViceBackup(this.newVicepresidentBackup).subscribe({
        next: () => {
          
          setTimeout(() => window.location.reload(), 100);
        },
        error: (err) => {
          console.error('Error updating the backup vicepresident :', err);
        }
      });

  }

  // =====================================================================================
  //   VICEPRESIDENTS
  // =====================================================================================
  

   /**
  * @description
  * Add a new aprover vicepresident
  */
  addVicepresident() {
    if (this.newVicepresident.trim()) {
      this.infoFormService.createVicepresident(this.newVicepresident).subscribe({
        next: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
        error: (err) => {
          console.error('Error updating the aprover vicepresident:', err);
        }
      });

      this.newSquad = '';
    }
  }



  /**
  * @description
  * Delete an aprover vicepresident
  */
  eliminateVicepresident(i: number) {
    const nameVicepresident = this.vicepresidentAprovers[i];

    this.infoFormService.eliminateVicepresident(nameVicepresident).subscribe({
      next: () => {
        setTimeout(() => window.location.reload(), 1000);
      },
      error: (err) => {
        console.error('Error eliminating the vicepresident aprover:', err);
      }
    });
  }
  
  /**
   * @description
   * user logout of the session.
   * Automatically redirect to the login page view
   */
  logout(){
    this.authService.logout();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    this.router.navigate(['/login']);
  }

 
}
