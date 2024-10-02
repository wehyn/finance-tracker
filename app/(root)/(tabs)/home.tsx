import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import TransactionCard from "@/components/TransactionCard"; // Make sure this is the updated version
import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import React from "react";

export default function Page() {
  const [data, setData] = useState([]); // Store transactions
  const [balance, setBalance] = useState(0); // Store user's balance
  const { user } = useUser(); // Get the user from Clerk

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

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        getTransactions(user.id);
      }
    }, [user])
  );

  // Function to group transactions by date
  const groupTransactionsByDate = (transactions) => {

    if (!transactions || transactions.length === 0) {
      return []; // Return an empty array if there are no transactions
    }

    const grouped = transactions.reduce((groups, transaction) => {
      const date = transaction.date.split("T")[0]; // Assuming date is in ISO format
      if (!groups[date]) {
        groups[date] = { date, transactions: [], totalAmount: 0 };
      }
      groups[date].transactions.push(transaction);
      groups[date].totalAmount += transaction.amount;
      return groups;
    }, {});

    return Object.values(grouped);
  };

  return (
    <SafeAreaView className="bg-tertiary h-full">
      <View className="flex-col mt-3 mx-3">
        <View className="flex flex-row justify-between items-center mb-3">
          {/* Display balance */}
          <Text className={`text-white font-JakartaBold text-2xl`}>
            ₱{balance}
          </Text>
          <View>
            <TouchableOpacity
              onPress={() => {
                router.push("/(root)/add-transaction");
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
          </View>
        </View>

        {/* Display Recent Transactions */}
        <FlatList
          data={groupTransactionsByDate(data)} // Render the updated grouped transaction data
          renderItem={({ item }) => <TransactionCard group={item} />} // Pass grouped data to TransactionCard
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={() => (
            <View className="flex flex-row items-center justify-between">
              <Text className="text-white font-JakartaSemiBold mt-5">
                Recent Transactions:{" "}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
