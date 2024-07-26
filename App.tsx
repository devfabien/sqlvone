import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [todo, setTodo] = useState("");
  const [visible, setVisible] = useState(false);
  const [todoArray, setTodoArray] = useState<any>();

  const db = SQLite.openDatabaseSync("todo.db");

  useEffect(() => {
    async function setup() {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, todo TEXT)`
      );

      const result = await db.getAllAsync(`SELECT * FROM todos`);
      setTodoArray(result);
    }
    setup();
  }, []);

  const addTodo = async () => {
    await db.runAsync(`INSERT INTO todos (todo) values (?)`, [todo]);
    const updatedResult = await db.getAllAsync(`SELECT * FROM todos`);
    setTodoArray(updatedResult);
    Alert.alert("todo added");
    setTodo("");
  };

  // const updateTodo = async () => {
  //   await db.runAsync(``);
  // };
  const deleteTodo = async (id: any) => {
    await db.runAsync(`DELETE FROM todos WHERE id=?`, [id]);
    const updatedResult = await db.getAllAsync(`SELECT * FROM todos`);
    setTodoArray(updatedResult);
    Alert.alert("Todo deleted");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyles}
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
                  <Text style={styles.dataText}>{el.todo}</Text>
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
    padding: 10,
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
