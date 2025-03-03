
import { Dispatch } from "react";

// Define the state type
export interface DashboardState {
  showBirdSounds: boolean;
  showTrends: boolean;
  showUserGuide: boolean;
  showAdminGuide: boolean;
  showUsers: boolean;
  isAdmin: boolean;
  currentTime: Date;
}

// Define action types
export type DashboardAction =
  | { type: 'TOGGLE_BIRD_SOUNDS' }
  | { type: 'TOGGLE_TRENDS' }
  | { type: 'TOGGLE_USER_GUIDE' }
  | { type: 'TOGGLE_ADMIN_GUIDE' }
  | { type: 'TOGGLE_USERS' }
  | { type: 'SET_ADMIN_STATUS'; payload: boolean }
  | { type: 'SET_TIME'; payload: Date };

// Define initial state for reducer
export const initialState: DashboardState = {
  showBirdSounds: false,
  showTrends: false,
  showUserGuide: false,
  showAdminGuide: false,
  showUsers: false,
  isAdmin: false,
  currentTime: new Date(),
};

// Reducer function to manage state changes
export const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'TOGGLE_BIRD_SOUNDS':
      return { ...state, showBirdSounds: !state.showBirdSounds }
    case 'TOGGLE_TRENDS':
      return { ...state, showTrends: !state.showTrends }
    case 'TOGGLE_USER_GUIDE':
      return { ...state, showUserGuide: !state.showUserGuide }
    case 'TOGGLE_ADMIN_GUIDE':
      return { ...state, showAdminGuide: !state.showAdminGuide }
    case 'TOGGLE_USERS':
      return { ...state, showUsers: !state.showUsers }
    case 'SET_ADMIN_STATUS':
      return { ...state, isAdmin: action.payload }
    case 'SET_TIME':
      return { ...state, currentTime: action.payload }
    default:
      return state
  }
};

// Custom hooks for dashboard actions
export const useDashboardActions = (dispatch: Dispatch<DashboardAction>) => {
  return {
    toggleBirdSounds: () => dispatch({ type: 'TOGGLE_BIRD_SOUNDS' }),
    toggleTrends: () => dispatch({ type: 'TOGGLE_TRENDS' }),
    toggleUserGuide: () => dispatch({ type: 'TOGGLE_USER_GUIDE' }),
    toggleAdminGuide: () => dispatch({ type: 'TOGGLE_ADMIN_GUIDE' }),
    toggleUsers: () => dispatch({ type: 'TOGGLE_USERS' }),
    setAdminStatus: (status: boolean) => dispatch({ type: 'SET_ADMIN_STATUS', payload: status }),
    setTime: (time: Date) => dispatch({ type: 'SET_TIME', payload: time })
  };
};
