import * as Yup from 'yup';

export interface UserFormValues {
  name: string;
  email: string;
  profile_image: string | null;
  dob: string;
}

export const userFormValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name must contain only letters'),
  email: Yup.string().email('Invalid email format'),
  dob: Yup.string().required('Date of Birth is required'),
  profile_image: Yup.string().nullable(),
});
