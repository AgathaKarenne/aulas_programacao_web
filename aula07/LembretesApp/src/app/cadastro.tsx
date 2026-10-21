import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroLembrete() {
  const router = useRouter();
  
  const [form, setForm] = useState({ titulo: '', descricao: '', horario: '', recorrencia: '' });

  useEffect(() => {
    async function configNotif() {
      await Notifications.requestPermissionsAsync();
      if (Platform.OS !== 'web') {
        await Notifications.setNotificationCategoryAsync('LEMBRETE_ACTIONS', [
          { identifier: 'CONCLUIR', buttonTitle: 'Concluir' },
          { identifier: 'ADIAR_ACT', buttonTitle: 'Adiar 10 min' },
        ]);
      }
    }
    configNotif();
  }, []);

  const handleSave = async () => {
    if (form.titulo === '') return; 

    let id = Date.now().toString();

    if (Platform.OS !== 'web') {
      id = await Notifications.scheduleNotificationAsync({
        content: {
          title: form.titulo,
          body: form.descricao,
          categoryIdentifier: 'LEMBRETE_ACTIONS',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        },
      });
    } 
    try {
      const listaAntiga = await AsyncStorage.getItem('@lembretes');
      const listaArray = listaAntiga ? JSON.parse(listaAntiga) : [];
      const novaLista = [...listaArray, { ...form, id }];
      
      await AsyncStorage.setItem('@lembretes', JSON.stringify(novaLista));
      
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Lembrete</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={form.titulo}
        onChangeText={(text) => setForm({ ...form, titulo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={form.descricao}
        onChangeText={(text) => setForm({ ...form, descricao: text })}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Horário (ex: 14:30)"
        value={form.horario}
        onChangeText={(text) => setForm({ ...form, horario: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Recorrência (ex: Diária, Única)"
        value={form.recorrencia}
        onChangeText={(text) => setForm({ ...form, recorrencia: text })}
      />
      
      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Salvar Lembrete</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.btn, {backgroundColor: 'gray', marginTop: 10}]} onPress={() => router.back()}>
        <Text style={styles.btnText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  btn: { backgroundColor: '#4F46E5', padding: 15, borderRadius: 5, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' }
});