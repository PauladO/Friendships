import { LightningElement, api } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;
  error;
  boatReviews;
  isLoading;
  
  // Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId() { return this.boatId; }
  set recordId(value) {
    //sets boatId attribute
    this.boatId = value;
    //sets boatId assignment
    this.getReviews();
  }
  
  // Getter to determine if there are reviews to display
  get reviewsToShow() {
    return this.boatReviews && this.boatReviews.length > 0;
  }
  
  // Public method to force a refresh of the reviews invoking getReviews
  @api
  refresh() {
    this.getReviews();
  }
  
  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  getReviews() {
    if (!this.boatId) { return; }
    this.isLoading = true;
    getAllReviews({ boatId: this.boatId }).then((reviews) => {
      this.boatReviews = reviews;
      this.isLoading = false;
    }).catch(e => {
      console.error(e);
      this.isLoading = false;
    });
  }
  
  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) { 
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: event.dataSet.recordId,
        actionName: 'view'
      }
    });
   }
}
