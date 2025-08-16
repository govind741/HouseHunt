const BASE_URL = 'http://houseapp.in:81/';

const ENDPOINT = {
  //Auth
  user_login: 'v1/auth/users/login',
  agent_login: 'v1/auth/agent/login',
  google_auth: 'v1/auth/user/auth/google',

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
  get_user_details: 'v1/auth/users/agent-detail',
  update_agent_profile: 'v1/auth/agent/profile-update',
  update_user_profile: 'v1/auth/users/profile',

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

export {BASE_URL, ENDPOINT};
