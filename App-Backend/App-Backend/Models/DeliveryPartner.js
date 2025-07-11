import mongoose from 'mongoose';

let DeliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: String,
  vehicleId: String,
  assignedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
});
let DeliveryPartner =  mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
export default DeliveryPartner;