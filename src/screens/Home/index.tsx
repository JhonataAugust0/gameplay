import React, { useState, useCallback } from "react";
import { View, FlatList, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLLECTION_APPOINTMENTS } from "../../configs/storage";

import { Background } from "../../components/Background";
import { Profile } from "../../components/Profile";
import { ButtonAdd } from "../../components/ButtonAdd";
import { CategorySelect } from "../../components/CategorySelect";
import { ListHeader } from "../../components/ListHeader";
import { ListDivider } from "../../components/ListDivider";
import { Appointment, AppointmentProps } from "../../components/Appointment";
import { Load } from "../../components/Load";

import { styles } from "./styles";
import { Button } from "../../components/Button";

export function Home() {
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentProps[]>([]);

  const navigation = useNavigation();

  function handleCategorySelect(categoryId: string) {
    categoryId === category ? setCategory("") : setCategory(categoryId);
  }

  function handleAppointmentDetails(guildSelected: AppointmentProps) {
    navigation.navigate("AppointmentDetails", { guildSelected });
  }

  function handleAppointmentCreate() {
    navigation.navigate("AppointmentCreate");
  }

  async function loadAppointments() {
    const response = await AsyncStorage.getItem(COLLECTION_APPOINTMENTS);
    const storage: AppointmentProps[] = response ? JSON.parse(response) : [];

    if (category) {
      setAppointments(storage.filter((item) => item.category === category));
    } else {
      setAppointments(storage);
    }

    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [category])
  );

  async function deleteAppointments() {
    await AsyncStorage.removeItem(COLLECTION_APPOINTMENTS);
  }

  async function handleDeleteAppointments() {
    Alert.alert("Espera aí!", "Quer mesmo limpar a agenda?", [
      {
        text: "Não, não",
        style: "cancel",
      },
      {
        text: "Sim, cansei!",
        onPress: () => {
          deleteAppointments();
          navigation.navigate("DropDatabaseSuccess");
        },
      },
    ]);
  }
  
  return (
    <Background>
      <View style={styles.header}>
        <Profile />
        <ButtonAdd onPress={handleAppointmentCreate} />
      </View>

      <CategorySelect
        categorySelected={category}
        setCategory={handleCategorySelect}
      />

      {isLoading ? (
        <Load />
      ) : (
        <>
          <ListHeader title="Partidas agendadas" subtitle={`Total ${appointments.length}`} />
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Appointment data={item} onPress={() => handleAppointmentDetails(item)} />
            )}
            contentContainerStyle={{ paddingBottom: 69 }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <ListDivider />}
            style={styles.matches}
          />
          <View style={styles.footer}>
            <Button
              title={"Excluir todas as partidas"}
              onPress={handleDeleteAppointments}
            />
          </View>
        </>
      )}
    </Background>
  );
}
