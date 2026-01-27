// ============================================
// MERCHANT DASHBOARD REAL-TIME ORDER LISTENER
// ============================================
// Add this script to merchant-dash.html to enable real-time order updates

<script>
let currentMerchantId = null;
let orderSubscription = null;

/**
 * Initialize real-time order listener for this merchant
 */
async function initializeOrderListener() {
    console.log('Initializing real-time order listener...');

    // Wait for Supabase and auth to be ready
    let attempts = 0;
    while (!window.supabaseClient && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (!window.supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }

    try {
        // Get current user (merchant)
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            console.error('No authenticated user');
            return;
        }

        // Get merchant info from database
        const { data: merchant, error } = await window.supabaseClient
            .from('merchants')
            .select('id, store_name')
            .eq('user_id', user.id)
            .single();

        if (error || !merchant) {
            console.error('Could not find merchant record:', error);
            return;
        }

        currentMerchantId = merchant.id;
        console.log(`✅ Merchant initialized: ${merchant.store_name} (ID: ${merchant.id})`);

        // Load initial orders
        await loadMerchantOrders();

        // Subscribe to real-time updates
        subscribeToOrders();

    } catch (error) {
        console.error('Error initializing order listener:', error);
    }
}

/**
 * Load all orders assigned to this merchant
 */
async function loadMerchantOrders() {
    if (!currentMerchantId) return;

    try {
        const { data: orders, error } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('assigned_merchant_id', currentMerchantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading orders:', error);
            return;
        }

        if (!orders || orders.length === 0) {
            console.log('No orders for this merchant');
            return;
        }

        console.log(`Loaded ${orders.length} orders`);

        // Organize orders by status
        const newOrders = orders.filter(o => o.order_status === 'sent_to_merchant');
        const processing = orders.filter(o => o.order_status === 'accepted');
        const completed = orders.filter(o => o.order_status === 'delivered');

        displayNewOrders(newOrders);
        displayProcessingOrders(processing);
        displayCompletedOrders(completed);
        updateOrderCounts(newOrders.length, processing.length, completed.length);

    } catch (error) {
        console.error('Error in loadMerchantOrders:', error);
    }
}

/**
 * Subscribe to real-time order changes
 */
function subscribeToOrders() {
    if (!currentMerchantId) return;

    // Unsubscribe from previous subscription if exists
    if (orderSubscription) {
        orderSubscription.unsubscribe();
    }

    // Subscribe to order changes for this merchant
    orderSubscription = window.supabaseClient
        .channel(`merchant-orders-${currentMerchantId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                table: 'orders',
                filter: `assigned_merchant_id=eq.${currentMerchantId}`
            },
            (payload) => {
                console.log('Order update received:', payload);
                handleOrderUpdate(payload);
            }
        )
        .subscribe();

    console.log('✅ Subscribed to real-time order updates');
}

/**
 * Handle real-time order updates
 */
function handleOrderUpdate(payload) {
    const { eventType, new: newOrder, old: oldOrder } = payload;

    if (eventType === 'INSERT') {
        console.log('🆕 New order received!');
        playNotificationSound();
        showNotificationBadge('new-order-badge');
        loadMerchantOrders(); // Reload all orders
    } else if (eventType === 'UPDATE') {
        console.log('📝 Order updated');
        loadMerchantOrders(); // Reload all orders
    } else if (eventType === 'DELETE') {
        console.log('🗑️ Order deleted');
        loadMerchantOrders();
    }
}

/**
 * Display new incoming orders
 */
function displayNewOrders(orders) {
    const container = document.getElementById('newOrdersList');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center py-20 text-slate-400 text-sm">No new orders at the moment.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-xs font-black text-red-600 uppercase">Order #${order.id.slice(0, 8)}</p>
                    <p class="text-sm font-bold text-slate-900 mt-1">${order.customer_name}</p>
                    <p class="text-xs text-slate-500 mt-0.5">📱 ${order.customer_phone}</p>
                </div>
                <span class="bg-red-100 text-red-700 text-[10px] px-3 py-1 rounded-full font-black">INCOMING</span>
            </div>

            <div class="bg-slate-50 p-3 rounded-lg mb-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase mb-2">Items:</p>
                <div class="space-y-1">
                    ${order.order_items.map(item => `
                        <p class="text-xs text-slate-700">• ${item.product_name} × ${item.quantity}</p>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <span class="text-sm font-bold text-slate-900">Tsh ${order.total_amount.toLocaleString()}</span>
                <span class="text-[10px] text-slate-500">${new Date(order.created_at).toLocaleTimeString()}</span>
            </div>

            <div class="flex gap-3">
                <button onclick="acceptOrder('${order.id}')" class="flex-1 py-3 bg-red-600 text-white rounded-lg text-xs font-black uppercase hover:bg-red-700 transition-colors">
                    ✓ Accept Order
                </button>
                <button onclick="deferOrder('${order.id}')" class="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg text-xs font-black uppercase hover:bg-slate-300 transition-colors">
                    ⏳ Defer
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Display orders being processed
 */
function displayProcessingOrders(orders) {
    const container = document.getElementById('processingList');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center py-20 text-slate-400 text-sm">No orders processing.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div class="flex justify-between mb-3">
                <p class="text-xs font-black text-slate-900 uppercase">Order #${order.id.slice(0, 8)}</p>
                <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-black">PACKING</span>
            </div>
            <p class="text-sm font-bold text-slate-900 mb-2">${order.customer_name}</p>
            <p class="text-sm text-slate-600 mb-4">Tsh ${order.total_amount.toLocaleString()}</p>
            
            <button onclick="markOrderReady('${order.id}')" class="w-full py-2 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors">
                📦 Ready for Pickup
            </button>
        </div>
    `).join('');
}

/**
 * Display completed orders
 */
function displayCompletedOrders(orders) {
    const container = document.getElementById('completedList');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-center py-20 text-slate-400 text-sm">No completed orders today.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <div class="flex justify-between mb-2">
                <p class="text-xs font-black text-green-900 uppercase">Order #${order.id.slice(0, 8)}</p>
                <span class="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-black">✓ DELIVERED</span>
            </div>
            <p class="text-sm font-bold text-slate-900">${order.customer_name}</p>
            <p class="text-xs text-slate-500 mt-1">${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

/**
 * Merchant accepts an order
 */
async function acceptOrder(orderId) {
    try {
        const { error } = await window.supabaseClient
            .from('orders')
            .update({
                order_status: 'accepted',
                merchant_accepted_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        console.log('✅ Order accepted');
        loadMerchantOrders();

    } catch (error) {
        console.error('Error accepting order:', error);
        alert('Hitilafu katika kukubali agizo');
    }
}

/**
 * Merchant defers an order
 */
async function deferOrder(orderId) {
    try {
        const { error } = await window.supabaseClient
            .from('orders')
            .update({
                order_status: 'deferred',
                deferred_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        console.log('⏳ Order deferred');
        loadMerchantOrders();

    } catch (error) {
        console.error('Error deferring order:', error);
        alert('Hitilafu katika kuahirisha agizo');
    }
}

/**
 * Merchant marks order as ready for pickup
 */
async function markOrderReady(orderId) {
    try {
        const { error } = await window.supabaseClient
            .from('orders')
            .update({
                order_status: 'ready_for_dispatch',
                ready_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        console.log('📦 Order marked ready');
        loadMerchantOrders();

    } catch (error) {
        console.error('Error marking order ready:', error);
        alert('Hitilafu katika kuandika hali');
    }
}

/**
 * Update order counts on dashboard
 */
function updateOrderCounts(newCount, processingCount, completedCount) {
    const newBadge = document.getElementById('count-new');
    const procBadge = document.getElementById('count-proc');
    const doneBadge = document.getElementById('count-done');

    if (newBadge) newBadge.textContent = newCount;
    if (procBadge) procBadge.textContent = processingCount;
    if (doneBadge) doneBadge.textContent = completedCount;
}

/**
 * Show notification badge when new order arrives
 */
function showNotificationBadge(elementId) {
    const badge = document.querySelector(`[id="${elementId}"]`);
    if (badge) {
        badge.classList.add('animate-pulse');
        setTimeout(() => {
            badge.classList.remove('animate-pulse');
        }, 5000);
    }
}

/**
 * Play notification sound (optional)
 */
function playNotificationSound() {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeOrderListener();
    }, 2000); // Give Supabase time to initialize
});
</script>
