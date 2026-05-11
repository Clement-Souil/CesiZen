import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent s'assure que l'application est correctement chargée 
// quel que soit l'environnement (Expo Go, build natif, etc.)
registerRootComponent(App);