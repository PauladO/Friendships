import { LightningElement, wire, track, api } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { MessageContext, publish } from 'lightning/messageService';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  @track
  selectedBoatId;
  columns = [
        {label: 'Name',         fieldName: 'Name',            editable: true }, 
        {label: 'Length',       fieldName: 'Length__c',       editable: true }, 
        {label: 'Price',        fieldName: 'Price__c',        editable: true }, 
        {label: 'Description',  fieldName: 'Description__c',  editable: true }
  ];

  @api
  boatTypeId = '';

  @track
  boats;
  
  @track
  isLoading = false;
  
  @wire(MessageContext)
  messageContext;

  @wire(getBoats, {
    boatTypeId: '$boatTypeId'
  })
  wiredBoats(result) {
    this.boats = result.data;
    if (result.error) {
        this.error = result.error;
        this.boats = undefined;
    }
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  }

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    const payload = { recordId: boatId };
    publish(this.messageContext, BOATMC, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {
      this.notifyLoading(false);
      const evt = new ShowToastEvent({
        title: SUCCESS_TITLE,
        message: MESSAGE_SHIP_IT,
        variant: SUCCESS_VARIANT,
      });
      this.dispatchEvent(evt);
    })
    .catch(error => {
      const evt = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.message,
        variant: ERROR_VARIANT,
      });
      this.dispatchEvent(evt);
    })
    .finally(() => {
      this.refresh();
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    this.isLoading = isLoading;
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    } else {
      this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }
}