import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListaLembretes() {
  const [lista, setLista] = useState<any[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarLembretes();
    }, [])
  );

  const carregarLembretes = async () => {
    try {
      const dados = await AsyncStorage.getItem('@lembretes');
      if (dados) setLista(JSON.parse(dados));
    } catch (e) {
      console.log('Erro ao carregar', e);
    }
  };

  const cancelarNotificacao = async (id: string) => {
    if (Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    const novaLista = lista.filter(item => item.id !== id);
    setLista(novaLista);
    await AsyncStorage.setItem('@lembretes', JSON.stringify(novaLista)); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Lembretes</Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.titulo}</Text>
              <Text>{item.descricao}</Text>
              <Text style={styles.details}>Horário: {item.horario} | Repetição: {item.recorrencia}</Text>
            </View>
            <TouchableOpacity onPress={() => cancelarNotificacao(item.id)}>
              <Text style={{ color: 'red', marginLeft: 10 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum lembrete cadastrado.</Text>}
      />

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/cadastro')}>
        <Text style={styles.btnText}>+ Novo Lembrete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  btn: { backgroundColor: '#4F46E5', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  card: { padding: 15, backgroundColor: '#f0f0f0', marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  details: { fontSize: 12, color: '#666', marginTop: 5 }
});