import { StatusBar } from "expo-status-bar";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputComponent from "./src/textIn";
import { ExpoSQLiteAdapter } from "@aws-amplify/datastore-storage-adapter/ExpoSQLiteAdapter";
import { Todo } from "./src/models";
import "@azure/core-asynciterator-polyfill";
import { Amplify } from "aws-amplify";
import config from "./src/amplifyconfiguration.json";

export default function App() {
  const [todo, setTodo] = useState("");
  const [todoArray, setTodoArray] = useState<any[]>();

  Amplify.configure(config);
  DataStore.configure({
    storageAdapter: ExpoSQLiteAdapter,
  });

  useEffect(() => {
    const init = async () => {
      await DataStore.start();

      DataStore.observeQuery(Todo).subscribe(async (snapshot) => {
        const { items } = snapshot;
        if (!items) {
          console.log("nno items");
        }
        setTodoArray(items);
      });
    };
    init();
  }, []);

  const addTodo = async () => {
    try {
      await DataStore.start();
      if (todo.trim().length > 0) {
        await DataStore.save(new Todo({ name: todo, completed: false }));
        const updatedResult = await DataStore.query(Todo);
        setTodoArray(updatedResult);
        Alert.alert("Todo added");
        setTodo("");
      }
    } catch (error) {
      console.warn("errrrror: ", error);
      Alert.alert("Failed to add todo");
    }
  };

  const updateTodo = async ({ task, id }: any) => {
    const original = await DataStore.query(Todo, id);
    if (original) {
      await DataStore.save(
        Todo.copyOf(original, (updated) => {
          updated.name = task;
        })
      );
    }
    const updatedResult = await DataStore.query(Todo);
    setTodoArray(updatedResult);
    Alert.alert("Todo Updated");
    setTodo("");
  };

  const deleteTodo = async (id: any) => {
    const toDelete = await DataStore.query(Todo, id);
    if (toDelete) {
      await DataStore.delete(toDelete);
    }
    const updatedResult = await DataStore.query(Todo);
    setTodoArray(updatedResult);
    Alert.alert("Todo deleted");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity
        style={{ padding: 15, backgroundColor: "black", marginTop: 40 }}
      >
        <Text style={{ color: "white" }}>Upload</Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <InputComponent
          placeholder="Enter text"
          onChangeText={setTodo}
          value={todo}
        />
        <TouchableOpacity style={styles.button} onPress={addTodo}>
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginVertical: 10, padding: 10 }}>
        {todoArray
          ? todoArray.map((el: any) => {
              return (
                <View key={el.id} style={styles.dataContainer}>
                  <Text style={styles.dataText}>{el.name}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "orange",
                      padding: 7,
                      borderRadius: 8,
                    }}
                    onPress={() => deleteTodo(el.id)}
                  >
                    <Text>Del</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "aqua",
                      padding: 7,
                      borderRadius: 8,
                    }}
                    onPress={() => updateTodo({ task: todo, id: el.id })}
                  >
                    <Text>Upd</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 10,
  },
  inputContainer: {
    marginVertical: 19,
    padding: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 7,
    flexDirection: "row",
    gap: 10,
  },
  inputStyles: {
    width: "80%",
  },
  button: {
    padding: 10,
    borderRadius: 7,
    backgroundColor: "yellow",
  },
  dataContainer: {
    borderTopWidth: 1,
    borderTopColor: "gray",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
  },
  dataText: {
    width: "80%",
  },
});
