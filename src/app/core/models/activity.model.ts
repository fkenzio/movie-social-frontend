import { MovieList } from './list.model';
import { Movie } from '@core/models/movie.model';


export interface Activity {
  id: number;
  user_id: number;
  activity_type: ActivityType;
  movie_id?: number;
  movie?: Movie;
  list_id?: number;
  list?: MovieList;
  created_at: string;
}

export type ActivityType = 'watched' | 'rated' | 'reviewed' | 'added_to_list';

export interface ActivityTimeline {
  activities: Activity[];
  page: number;
  total_pages: number;
  total_results: number;
}