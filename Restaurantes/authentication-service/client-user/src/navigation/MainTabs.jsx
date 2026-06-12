import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RestaurantsScreen from '../features/restaurants/screens/RestaurantsScreen.jsx';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen.jsx';
import MenuScreen from '../features/menu/screens/MenuScreen.jsx';
import MenuDetailScreen from '../features/menu/screens/MenuDetailScreen.jsx';
import CreateOrderScreen from '../features/orders/screens/CreateOrderScreen.jsx';
import ReservationsScreen from '../features/reservations/screens/ReservationsScreen.jsx';
import CreateReservationScreen from '../features/reservations/screens/CreateReservationScreen.jsx';
import OrdersScreen from '../features/orders/screens/OrdersScreen.jsx';
import TablesScreen from '../features/tables/screens/TablesScreen.jsx';
import ProfileScreen from '../features/profile/screens/ProfileScreen.jsx';

const Tab = createBottomTabNavigator();
const RestaurantsStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const ReservationsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function RestaurantsStackNavigator() {
  return (
    <RestaurantsStack.Navigator screenOptions={{ headerShown: false }}>
      <RestaurantsStack.Screen name="Restaurants" component={RestaurantsScreen} />
      <RestaurantsStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <RestaurantsStack.Screen name="Tables" component={TablesScreen} />
    </RestaurantsStack.Navigator>
  );
}

function MenuStackNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
      <MenuStack.Screen name="MenuDetail" component={MenuDetailScreen} />
      <MenuStack.Screen name="CreateOrder" component={CreateOrderScreen} />
    </MenuStack.Navigator>
  );
}

function ReservationsStackNavigator() {
  return (
    <ReservationsStack.Navigator screenOptions={{ headerShown: false }}>
      <ReservationsStack.Screen name="Reservations" component={ReservationsScreen} />
      <ReservationsStack.Screen name="CreateReservation" component={CreateReservationScreen} />
    </ReservationsStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
      <OrdersStack.Screen name="CreateOrder" component={CreateOrderScreen} />
    </OrdersStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="RestaurantsTab" component={RestaurantsStackNavigator} options={{ title: 'Restaurantes' }} />
      <Tab.Screen name="MenuTab" component={MenuStackNavigator} options={{ title: 'Menú' }} />
      <Tab.Screen name="ReservationsTab" component={ReservationsStackNavigator} options={{ title: 'Reservas' }} />
      <Tab.Screen name="OrdersTab" component={OrdersStackNavigator} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
