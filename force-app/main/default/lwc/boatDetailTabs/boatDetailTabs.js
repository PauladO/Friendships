import { LightningElement, wire } from 'lwc';
import labelDetails from '@salesforce/label/c.Details';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelReviews from '@salesforce/label/c.Reviews';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_TYPE_FIELD from '@salesforce/schema/Boat__c.BoatType__c';
import BOAT_LENGTH_FIELD from '@salesforce/schema/Boat__c.Length__c';
import BOAT_PRICE_FIELD from '@salesforce/schema/Boat__c.Price__c';
import BOAT_DESCRIPTION_FIELD from '@salesforce/schema/Boat__c.Description__c';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe,  MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD, BOAT_TYPE_FIELD, BOAT_LENGTH_FIELD, BOAT_PRICE_FIELD, BOAT_DESCRIPTION_FIELD ];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, {
    recordId:'$boatId',
    fields: BOAT_FIELDS
  })
  wiredRecord;

  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
 
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
    return this.wiredRecord && this.wiredRecord.data ? 'utility:anchor' : null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return getFieldValue(this.wiredRecord, BOAT_NAME_FIELD);
  }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.boatId = message.recordId,
      {scope: APPLICATION_SCOPE}
   );
  }
  
  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }
  
  // Navigates to record page
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.boatId,
        actionName: 'view'
      }
    });
  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}