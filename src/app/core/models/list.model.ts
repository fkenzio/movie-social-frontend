import { User } from '@core/models/user.model';
import { Movie } from '@core/models/movie.model';


export interface MovieList {
  id: number;
  user_id: number;
  user?: User; // Usuario creador
  name: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
  movies_count: number;
  collaborators_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListDetail extends MovieList {
  movies: ListMovie[];
  collaborators?: Collaborator[];
}

export interface ListMovie {
  id: number;
  movie: Movie;
  added_at: string;
  position: number;
  added_by?: User;
}

export interface Collaborator {
  id: number;
  user: User;
  can_edit: boolean;
  added_at: string;
}

export interface CreateListRequest {
  name: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface AddMovieToListRequest {
  movie_id: number;
  position?: number;
}

export interface AddCollaboratorRequest {
  user_id: number;
  can_edit: boolean;
}