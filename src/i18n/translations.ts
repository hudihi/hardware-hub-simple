export type Language = 'sw' | 'en';

export const translations = {
  // Navbar
  nav_home: { sw: 'Nyumbani', en: 'Home' },
  nav_products: { sw: 'Bidhaa', en: 'Products' },
  nav_orders: { sw: 'Maagizo', en: 'Orders' },
  nav_cart: { sw: 'Kikapu', en: 'Cart' },

  // Home
  home_welcome: { sw: 'Karibu PAHALA.COM', en: 'Welcome to PAHALA.COM' },
  home_subtitle: { sw: 'Duka lako la vifaa vya ujenzi la kuaminika', en: 'Your trusted hardware store' },
  home_search_placeholder: { sw: 'Tafuta bidhaa...', en: 'Search products...' },
  home_categories: { sw: 'Makundi', en: 'Categories' },
  home_featured: { sw: 'Bidhaa Maarufu', en: 'Featured Products' },
  home_view_all: { sw: 'Ona Zote', en: 'View All' },
  home_need_help: { sw: 'Unahitaji Msaada?', en: 'Need Help?' },
  home_help_text: { sw: 'Timu yetu ya masoko iko tayari kukusaidia', en: 'Our marketing team is ready to help you' },
  home_call: { sw: 'Piga Simu', en: 'Call Us' },

  // Categories
  cat_tools: { sw: 'Vifaa', en: 'Tools' },
  cat_electrical: { sw: 'Umeme', en: 'Electrical' },
  cat_plumbing: { sw: 'Mabomba', en: 'Plumbing' },
  cat_paint: { sw: 'Rangi', en: 'Paint' },
  cat_building: { sw: 'Ujenzi', en: 'Building' },
  cat_garden: { sw: 'Bustani', en: 'Garden' },

  // Products page
  products_all: { sw: 'Zote', en: 'All' },
  products_found: { sw: 'zimepatikana', en: 'found' },
  products_none: { sw: 'Hakuna bidhaa zilizopatikana', en: 'No products found' },
  products_try_different: { sw: 'Jaribu kubadilisha utafutaji au kichujio', en: 'Try changing your search or filter' },
  products_add: { sw: 'Ongeza', en: 'Add' },
  products_share: { sw: 'Shiriki', en: 'Share' },

  // Product detail
  product_back: { sw: 'Rudi', en: 'Back' },
  product_available: { sw: 'Inapatikana', en: 'Available' },
  product_in_stock: { sw: 'zinapatikana', en: 'in stock' },
  product_quantity: { sw: 'Idadi', en: 'Quantity' },
  product_total: { sw: 'Jumla', en: 'Total' },
  product_add_to_cart: { sw: 'Ongeza kwenye Kikapu', en: 'Add to Cart' },
  product_not_found: { sw: 'Bidhaa haijapatikana', en: 'Product not found' },
  product_view_products: { sw: 'Tazama Bidhaa', en: 'View Products' },

  // Cart
  cart_title: { sw: 'Kikapu cha Ununuzi', en: 'Shopping Cart' },
  cart_empty: { sw: 'Kikapu chako kipo tupu', en: 'Your cart is empty' },
  cart_empty_desc: { sw: 'Ongeza bidhaa ili kuanza', en: 'Add products to get started' },
  cart_clear: { sw: 'Futa Zote', en: 'Clear All' },
  cart_subtotal: { sw: 'Jumla Ndogo', en: 'Subtotal' },
  cart_shipping: { sw: 'Usafirishaji', en: 'Shipping' },
  cart_cod: { sw: 'Lipa Unapopokea', en: 'Pay on Delivery' },
  cart_total: { sw: 'Jumla', en: 'Total' },
  cart_checkout: { sw: 'Endelea Kulipa', en: 'Proceed to Checkout' },
  cart_share_wa: { sw: 'Shiriki kupitia WhatsApp', en: 'Share via WhatsApp' },

  // Checkout
  checkout_title: { sw: 'Malipo', en: 'Checkout' },
  checkout_back_cart: { sw: 'Rudi kwenye Kikapu', en: 'Back to Cart' },
  checkout_contact: { sw: 'Taarifa za Mawasiliano', en: 'Contact Information' },
  checkout_name: { sw: 'Jina Kamili', en: 'Full Name' },
  checkout_name_ph: { sw: 'Ingiza jina lako kamili', en: 'Enter your full name' },
  checkout_email: { sw: 'Barua Pepe', en: 'Email' },
  checkout_email_ph: { sw: 'barua@mfano.com', en: 'email@example.com' },
  checkout_phone: { sw: 'Nambari ya Simu', en: 'Phone Number' },
  checkout_phone_ph: { sw: '07xx xxx xxx', en: '07xx xxx xxx' },
  checkout_password: { sw: 'Nenosiri', en: 'Password' },
  checkout_password_ph: { sw: 'Tengeneza nenosiri (angalau herufi 6)', en: 'Create password (at least 6 characters)' },
  checkout_password_hint: { sw: 'Tengeneza akaunti ili kufuatilia maagizo yako', en: 'Create an account to track your orders' },
  checkout_address: { sw: 'Anwani ya Uwasilishaji', en: 'Delivery Address' },
  checkout_street: { sw: 'Anwani ya Mtaa', en: 'Street Address' },
  checkout_street_ph: { sw: 'Mtaa, nambari ya nyumba, jengo', en: 'Street, house number, building' },
  checkout_city: { sw: 'Mji', en: 'City' },
  checkout_province: { sw: 'Mkoa', en: 'Province' },
  checkout_postal: { sw: 'Nambari ya Posta', en: 'Postal Code' },
  checkout_notes_title: { sw: 'Maelezo ya Agizo (Si Lazima)', en: 'Order Notes (Optional)' },
  checkout_notes_ph: { sw: 'Maelekezo maalum kwa agizo lako...', en: 'Special instructions for your order...' },
  checkout_payment: { sw: 'Njia ya Malipo', en: 'Payment Method' },
  checkout_cod_title: { sw: 'Lipa Unapopokea', en: 'Pay on Delivery' },
  checkout_cod_desc: { sw: 'Lipa unapopokea agizo lako', en: 'Pay when you receive your order' },
  checkout_summary: { sw: 'Muhtasari wa Agizo', en: 'Order Summary' },
  checkout_submit: { sw: 'Weka Agizo', en: 'Place Order' },
  checkout_loading: { sw: 'Inashughulika...', en: 'Processing...' },
  checkout_email_taken: { sw: 'Barua pepe imeshasajiliwa. Tafadhali ingia au tumia barua pepe nyingine.', en: 'Email already registered. Please login or use a different email.' },
  checkout_error: { sw: 'Kuna tatizo limetokea. Tafadhali jaribu tena.', en: 'Something went wrong. Please try again.' },
  checkout_wa_confirm: { sw: 'Je, ungependa kushiriki agizo lako kupitia WhatsApp?', en: 'Would you like to share your order via WhatsApp?' },

  // Orders
  orders_title: { sw: 'Maagizo Yangu', en: 'My Orders' },
  orders_empty: { sw: 'Hakuna maagizo bado', en: 'No orders yet' },
  orders_empty_desc: { sw: 'Anza kununua ili kuona maagizo yako hapa', en: 'Start shopping to see your orders here' },
  orders_help: { sw: 'Unahitaji msaada na agizo lako?', en: 'Need help with your order?' },
  orders_more: { sw: 'bidhaa zaidi', en: 'more items' },
  orders_share: { sw: 'Shiriki', en: 'Share' },
  orders_details: { sw: 'Maelezo', en: 'Details' },

  // Order detail
  order_not_found: { sw: 'Agizo halijapatikana', en: 'Order not found' },
  order_view_all: { sw: 'Ona Maagizo Yote', en: 'View All Orders' },
  order_back: { sw: 'Rudi kwa Maagizo', en: 'Back to Orders' },
  order_success: { sw: 'Agizo limewekwa kwa mafanikio!', en: 'Order placed successfully!' },
  order_success_desc: { sw: 'Tutashughulikia agizo lako hivi karibuni. Asante!', en: 'We will process your order soon. Thank you!' },
  order_share_wa: { sw: 'Shiriki Agizo kupitia WhatsApp', en: 'Share Order via WhatsApp' },
  order_items: { sw: 'Bidhaa za Agizo', en: 'Order Items' },
  order_address: { sw: 'Anwani ya Uwasilishaji', en: 'Delivery Address' },
  order_payment: { sw: 'Njia ya Malipo', en: 'Payment Method' },
  order_notes: { sw: 'Maelezo ya Agizo', en: 'Order Notes' },
  order_help: { sw: 'Una maswali kuhusu agizo lako?', en: 'Have questions about your order?' },

  // Admin
  admin_title: { sw: 'PAHALA Msimamizi', en: 'PAHALA Admin' },
  admin_back: { sw: 'Rudi Dukani', en: 'Back to Store' },
  admin_dashboard: { sw: 'Dashibodi', en: 'Dashboard' },
  admin_products: { sw: 'Bidhaa', en: 'Products' },
  admin_orders: { sw: 'Maagizo', en: 'Orders' },
  admin_total_products: { sw: 'Jumla ya Bidhaa', en: 'Total Products' },
  admin_total_orders: { sw: 'Jumla ya Maagizo', en: 'Total Orders' },
  admin_pending_orders: { sw: 'Maagizo Yanasubiri', en: 'Pending Orders' },
  admin_total_revenue: { sw: 'Jumla ya Mapato', en: 'Total Revenue' },
  admin_recent_orders: { sw: 'Maagizo ya Hivi Karibuni', en: 'Recent Orders' },
  admin_no_orders: { sw: 'Hakuna maagizo bado', en: 'No orders yet' },
  admin_order_id: { sw: 'Nambari ya Agizo', en: 'Order ID' },
  admin_customer: { sw: 'Mteja', en: 'Customer' },
  admin_items: { sw: 'bidhaa', en: 'items' },
  admin_status: { sw: 'Hali', en: 'Status' },
  admin_add_product: { sw: 'Ongeza Bidhaa', en: 'Add Product' },
  admin_search_products: { sw: 'Tafuta bidhaa...', en: 'Search products...' },
  admin_all_categories: { sw: 'Makundi Yote', en: 'All Categories' },
  admin_category: { sw: 'Kundi', en: 'Category' },
  admin_price: { sw: 'Bei', en: 'Price' },
  admin_stock: { sw: 'Stoku', en: 'Stock' },
  admin_actions: { sw: 'Vitendo', en: 'Actions' },
  admin_showing: { sw: 'Inaonyesha', en: 'Showing' },
  admin_of: { sw: 'kati ya', en: 'of' },
  admin_date: { sw: 'Tarehe', en: 'Date' },
  admin_all: { sw: 'Yote', en: 'All' },
  admin_no_orders_found: { sw: 'Hakuna maagizo yaliyopatikana', en: 'No orders found' },

  // Status
  status_pending: { sw: 'Inasubiri', en: 'Pending' },
  status_confirmed: { sw: 'Imethibitishwa', en: 'Confirmed' },
  status_processing: { sw: 'Inashughulikiwa', en: 'Processing' },
  status_ready: { sw: 'Tayari Kuchukuliwa', en: 'Ready for Pickup' },
  status_completed: { sw: 'Imekamilika', en: 'Completed' },
  status_cancelled: { sw: 'Imeghairiwa', en: 'Cancelled' },

  // WhatsApp
  wa_chat: { sw: 'Tuandikie', en: 'Chat with us' },

  // Language
  lang_toggle: { sw: 'EN', en: 'SW' },
} as const;

export type TranslationKey = keyof typeof translations;
