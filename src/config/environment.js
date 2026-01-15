import { Platform } from 'react-native';

// CONFIGURAÇÃO DE AMBIENTE
// Se você estiver usando um dispositivo físico, altere para o IP da sua máquina
const USE_PHYSICAL_DEVICE = false; // Mude para true se estiver usando celular físico
const LOCAL_IP = '192.168.0.13'; // Seu IP local (execute ipconfig no Windows para descobrir)

export const getApiUrl = () => {
  if (USE_PHYSICAL_DEVICE) {
    return `http://${LOCAL_IP}:4000/api`;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api'; // Android Emulator
  }
  
  return 'http://localhost:4000/api'; // iOS Simulator ou Web
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 10000,
};
