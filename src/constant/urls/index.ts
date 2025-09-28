const BASE_URL = 'https://api.houseapp.in/';

// App download links
const APP_DOWNLOAD_LINKS = {
  PLAY_STORE: 'https://play.google.com/store/apps/details?id=com.houseapp',
  APP_STORE: 'https://apps.apple.com/app/houseapp/id123456789',
  WEBSITE: 'https://houseapp.in/download',
};

const ENDPOINT = {
  //Auth
  user_login: 'v1/auth/users/login',
  google_auth: 'v1/auth/user/auth/google',
  agent_login: 'v1/auth/agent/login',

  verify_user: 'v1/auth/users/verify-otp',
  verify_agent: 'v1/auth/agent/verify-otp',

  resend_user_otp: 'v1/auth/users/resent-otp',
  resend_agent_otp: 'v1/auth/agent/resent-otp',

  register_user: 'v1/auth/users/register',
  register_agent: 'v1/auth/agent/register',

  //App
  get_agent_by_location: 'v1/auth/users/by-location',

  //profile
  get_agent_details: 'v1/auth/users/agent-detail',
  get_user_details: 'v1/auth/users/user-detail',
  update_agent_profile: 'v1/auth/agent/profile-update',
  update_user_profile: 'v1/auth/users/profile',

  // Agent specific endpoints
  agent_profile: 'v1/auth/agent/profile',
  agent_office_address: 'v1/auth/agent/office-address',
  agent_working_locations: 'v1/auth/agent/working-locations',

  //delete
  delete_agent: 'v1/auth/agent/verify-delete-account',
  delete_user: 'v1/auth/users/delete-account',

  verify_delete_user: 'v1/auth/users/verify-delete-account',

  user_interaction: 'v1/auth/users/interactions/click',
  get_city: 'v1/auth/cities',
  get_areas: 'v1/auth/areas',
  get_localities: 'v1/auth/localities',
  search_localities: 'v1/auth/search/localities',

  //reviews
  get_reviews: 'v1/auth/users/reviews',
  add_reviews: 'v1/auth/users/reviews',
  update_review: 'v1/auth/users/reviews/update',
  delete_review: 'v1/auth/users/reviews/delete',

  //bookmark
  bookmark: 'v1/auth/users/bookmark',

  //home slider
  slider_info: 'v1/auth/users/banners/active',

  work_location: 'v1/auth/agent/working-locations',
  public_agents: 'v1/auth/users/public/by-location?locationId=',
  user_details: 'v1/auth/users/user-detail/',

  //payment options
  agent_payment_details: 'v1/auth/admin/payment-details',
  agent_payment_qr_upload: 'v1/auth/agent/payment-qr-upload',
};

export {BASE_URL, ENDPOINT, APP_DOWNLOAD_LINKS};
