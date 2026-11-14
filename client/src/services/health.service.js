import { http } from './http';

/** Services are thin: they call the API and unwrap `{ success, data }` so views just get `data`. */
export const getHealth = async () => (await http.get('/health')).data.data;
