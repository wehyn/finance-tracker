import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import TransactionCard from "@/components/TransactionCard";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import DateTimePickerModal

export default function Page() {
  const [form, setForm] = useState({
    amount: "0",
    category: "",
    date: new Date(),
    status: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility
  const [data, setData] = useState([]); // Store transactions
  const [addTransactionModal, setAddTransactionModal] = useState(false);
  const [balance, setBalance] = useState(0); // Store user's balance
  const { user } = useUser(); // Get the user from Clerk

  // Function to add a transaction
  const addTransaction = async () => {
    try {
      await fetchAPI("/(api)/transaction", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          transaction_id: Math.floor(Math.random() * 1000000),
          date: form.date,
          category: form.category,
          amount: form.amount,
          status: form.status,
        }),
      });
      // Refetch the transactions after adding a new one
      if (user?.id) {
        getTransactions(user.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch the balance and transaction list
  const getTransactions = async (id: string) => {
    try {
      const response = await fetch(`/(api)/${id}`);
      const data = await response.json();
      setData(data.data); // Update the transaction list
      setBalance(data.data[0]?.balance || 0); // Update the balance if available
    } catch (error) {
      console.error(error);
    }
  };

  // Load balance and transactions when the component mounts
  useEffect(() => {
    if (user?.id) {
      getTransactions(user.id);
    }
  }, [user]);

  // Handle DatePicker confirmation
  const handleConfirm = (selectedDate) => {
    setShowDatePicker(false); // Close DateTimePickerModal
    setForm({ ...form, date: selectedDate }); // Set selected date in form
  };

  return (
    <SafeAreaView className="bg-tertiary h-full">
      <View className="flex-col mt-3 mx-5">
        <View className="flex flex-row justify-between items-center">
          {/* Display balance */}
          <Text className="text-white font-JakartaBold text-2xl">
            ₱{balance}
          </Text>
          <View>
            <TouchableOpacity
              onPress={() => {
                setAddTransactionModal(true);
              }}
              className="w-12 h-12 rounded-full bg-general-400 flex justify-center items-center pb-1"
            >
              <Text className="text-white font-JakartaExtraBold flex-row mt-2">
                <Image
                  source={icons.plus}
                  tintColor={"white"}
                  className="w-7 h-7"
                />
              </Text>
            </TouchableOpacity>

            {/* Add Transaction Modal */}
            <ReactNativeModal isVisible={addTransactionModal}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="bg-tertiary px-7 py-9 rounded-2xl min-h-[300px]"
              >
                <InputField
                  label=""
                  placeholder="Amount"
                  value={form.amount}
                  onChangeText={(value) => setForm({ ...form, amount: value })}
                  keyboardType="numeric"
                />
                <InputField
                  label=""
                  placeholder="Category"
                  value={form.category}
                  onChangeText={(value) =>
                    setForm({ ...form, category: value })
                  }
                />

                {/* TouchableOpacity to trigger DateTimePickerModal */}
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-[#2a2b2e] p-4 my-2"
                >
                  <Text className="text-white font-JakartaSemiBold">
                    {form.date
                      ? form.date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) // Format the date as "Feb 29, 2024"
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>

                {/* DateTimePickerModal */}
                <DateTimePickerModal
                  isVisible={showDatePicker} // Show DateTimePickerModal when triggered
                  mode="date" // Date mode only
                  date={form.date ? new Date(form.date) : new Date()} // Default date in picker
                  onConfirm={handleConfirm} // Handle confirmed date
                  onCancel={() => setShowDatePicker(false)} // Close DateTimePickerModal on cancel
                />

                <CustomButton
                  title="Done"
                  onPress={() => {
                    addTransaction(); // Add transaction
                    setAddTransactionModal(false); // Close the modal
                    setForm({
                      amount: "0",
                      category: "",
                      date: new Date(),
                      status: "",
                    }); // Clear form
                  }}
                  className="mt-2 bg-success-500 mb-5"
                />
              </KeyboardAvoidingView>
            </ReactNativeModal>
          </View>
        </View>

        {/* Display Recent Transactions */}
        <View className="mt-10">
          <Text className="text-white font-Jakarta">Recent Transactions: </Text>
        </View>
        <FlatList
          data={data} // Render the updated transaction data
          renderItem={({ item }) => <TransactionCard transaction={item} />}
        />
      </View>
    </SafeAreaView>
  );
}
