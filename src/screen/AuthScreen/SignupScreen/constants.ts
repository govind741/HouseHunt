import * as Yup from 'yup';

export interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  profile_image: string | null;
}

export const userFormValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name must contain only letters'),
  email: Yup.string().email('Invalid email format').optional(),
  phone: Yup.string().optional(),
  profile_image: Yup.string().nullable(),
});
