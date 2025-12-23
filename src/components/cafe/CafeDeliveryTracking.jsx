import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { getDeliveryOrders, updateOrderDeliveryStatus } from '../../services/cafeService';

const CafeDeliveryTracking = ({ showToast }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDeliveries();
  }, [selectedDate]);

  const loadDeliveries = async () => {
    const data = await getDeliveryOrders(selectedDate);
    setDeliveries(data);
  };

  const handleStatusUpdate = async (orderId, status, deliveryPerson = null) => {
    try {
      await updateOrderDeliveryStatus(orderId, {
        deliveryStatus: status,
        deliveryPerson: deliveryPerson,
        deliveryTime: status === 'delivered' ? new Date().toISOString() : null,
      });

      showToast(`✅ Delivery status updated to ${status}`);
      await loadDeliveries();
    } catch (error) {
      showToast('❌ Error updating delivery status');
      console.error(error);
    }
  };

  const handleDeliveryPersonChange = async (orderId, deliveryPerson) => {
    try {
      await updateOrderDeliveryStatus(orderId, {
        deliveryPerson: deliveryPerson,
      });

      showToast('✅ Delivery person assigned');
      await loadDeliveries();
    } catch (error) {
      showToast('❌ Error assigning delivery person');
      console.error(error);
    }
  };

  const filteredDeliveries = filterStatus === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.delivery_status === filterStatus);

  const pendingCount = deliveries.filter(d => d.delivery_status === 'pending').length;
  const inTransitCount = deliveries.filter(d => d.delivery_status === 'in_transit').length;
  const deliveredCount = deliveries.filter(d => d.delivery_status === 'delivered').length;
  const failedCount = deliveries.filter(d => d.delivery_status === 'failed').length;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Delivery Tracking
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">
            Manage and track delivery orders
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Pending</p>
              <p className="text-2xl md:text-3xl font-black text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">In Transit</p>
              <p className="text-2xl md:text-3xl font-black text-blue-600">{inTransitCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Delivered</p>
              <p className="text-2xl md:text-3xl font-black text-green-600">{deliveredCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Failed</p>
              <p className="text-2xl md:text-3xl font-black text-red-600">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in_transit', 'delivered', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No deliveries found for {new Date(selectedDate).toLocaleDateString()}</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      delivery.delivery_status === 'delivered' ? 'bg-green-100' :
                      delivery.delivery_status === 'in_transit' ? 'bg-blue-100' :
                      delivery.delivery_status === 'failed' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {delivery.delivery_status === 'delivered' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       delivery.delivery_status === 'in_transit' ? <Truck className="w-5 h-5 text-blue-600" /> :
                       delivery.delivery_status === 'failed' ? <XCircle className="w-5 h-5 text-red-600" /> :
                       <Clock className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{delivery.order_number}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          delivery.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' :
                          delivery.delivery_status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                          delivery.delivery_status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {delivery.delivery_status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold">{delivery.customer_name}</p>
                      {delivery.customer_phone && (
                        <p className="text-sm text-gray-500">{delivery.customer_phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {delivery.delivery_address && (
                    <div className="flex items-start gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-sm text-gray-700">{delivery.delivery_address}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {(delivery.items || []).map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Person */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={delivery.delivery_person || ''}
                      onChange={(e) => handleDeliveryPersonChange(delivery.id, e.target.value)}
                      placeholder="Assign delivery person"
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Delivery Time */}
                  {delivery.delivery_time && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Delivered at {new Date(delivery.delivery_time).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {delivery.delivery_notes && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">{delivery.delivery_notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2">
                  <div className="text-right mb-2 hidden md:block">
                    <p className="text-2xl font-black text-gray-900">₹{delivery.total_amount}</p>
                  </div>
                  
                  {delivery.delivery_status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'in_transit', delivery.delivery_person)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm whitespace-nowrap"
                    >
                      <Truck className="w-4 h-4" />
                      Start Delivery
                    </button>
                  )}
                  
                  {delivery.delivery_status === 'in_transit' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(delivery.id, 'delivered', delivery.delivery_person)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(delivery.id, 'failed', delivery.delivery_person)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Mark Failed
                      </button>
                    </>
                  )}

                  {delivery.delivery_status === 'failed' && (
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'pending', delivery.delivery_person)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold text-sm whitespace-nowrap"
                    >
                      <Clock className="w-4 h-4" />
                      Retry
                    </button>
                  )}

                  {delivery.delivery_status === 'delivered' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CafeDeliveryTracking;
