import { environment } from '../environments/environment';
import { ColumnSetting, Lookup,NumberColumn } from './../utils/utils';
import { Component } from '@angular/core';
import * as models from './models';
import * as utils from '../utils/utils';
import * as db from '../utils/localStorageDataProvider';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  myNumber = new NumberColumn({caption:'my number',value:5});
  myNumber1 = new NumberColumn({caption:'my number',value:2});
  myNumber2 = new NumberColumn({caption:'my number',value:3});
  myArea = new utils.DataAreaSettings({
    columnSettings:()=>[this.myNumber,this.myNumber1,this.myNumber2,{caption:'1234',getValue:()=>this.myNumber.value+this.myNumber1.value}]
  });
  categories = new utils.GridSettings(new models.Categories(), {
    get: {limit:100},
    allowUpdate: true,
    allowDelete: true,
    allowInsert: true
  });
  pForLookup = new models.Products();
  pLookUp = new utils.Lookup(this.pForLookup);
  orderDetailsSettings = new utils.GridSettings(new models.Order_details(), {
     allowDelete: true,
    allowUpdate: true,
     allowInsert: true,

    columnSettings: orderDetails => [
      {
        column: orderDetails.productID,
        dropDown: { source: new models.Products() },
        onUserChangedValue: od => this.pLookUp.whenGet(e=>e.id.isEqualTo(od.productID)).then(p => od.unitPrice.value = p.unitPrice.value)   
      },

      orderDetails.unitPrice,
      orderDetails.quantity,
      { caption: 'row total', getValue: od => od.unitPrice.value * od.quantity.value }
    ],
    onNewRow: od => {
      od.orderID.value = this.settings.currentRow.id.value;
      od.unitPrice.value = 1;
    }
  });


  customersSelect = new utils.GridSettings(new models.Customers(), {
    numOfColumnsInGrid: 4,
    columnSettings: customers => [
      customers.id,
      customers.companyName,
      customers.contactName,
      customers.country,
      customers.address,
      customers.city
    ]
  });


  settings = new utils.GridSettings(new models.Orders(), {
    numOfColumnsInGrid: 4,

    allowUpdate: true,
    //   allowInsert: true,
    get: { limit: 3, orderBy: o => new utils.Sort({ column: o.id, descending: true }) },

    onEnterRow: orders => {

      this.orderDetailsSettings.get({ where: orderDetails => orderDetails.orderID.isEqualTo(orders.id), additionalUrlParameters: { cust: orders.customerID } })
    },
    columnSettings: orders => [
      {
        column: orders.id,
        caption: 'order id',
      },
      {
        column: orders.customerID,

        getValue: orders => orders.lookup(new models.Customers(), c => c.id.isEqualTo(orders.customerID)).companyName,
        //getValue: o => o.lookup(new models.Customers(), o.customerID).companyName,
        click: o => this.customersSelect.showSelectPopup(c => o.customerID.value = c.id.value)
      },
      orders.orderDate,
      {
        column: orders.shipVia, dropDown: {
          source: new models.Shippers()
        }
      }

    ],
    rowCssClass: o => o.orderDate.getDayOfWeek() == 2 ? 'danger' : ''
  });
  shipInfoArea = this.settings.addArea({
    columnSettings: orders => [
      orders.requiredDate,
      orders.shippedDate,
      orders.shipAddress,
      orders.shipCity
    ]
  });
  getOrderTotal() {
    let r = 0;
    this.orderDetailsSettings.items.forEach(od => r += od.unitPrice.value * od.quantity.value);
    return r;
  }
  printOrder() {
    window.open(environment.serverUrl + 'home/print/' + this.settings.currentRow.id.value, '_blank');
  }
  test() {
    fetch('http://localhost:3000/dataApi/Categories/0', { method: 'delete', credentials: 'include' }).then((response) => {
      console.log(response);
    },
      error => {
        console.log(error);

      }).catch(error => {
        console.log(error); //noam

      });
  }
}
