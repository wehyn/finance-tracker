import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import TransactionCard from "@/components/TransactionCard"; // Make sure this is the updated version
import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useActionSheet } from "@expo/react-native-action-sheet";

interface Transaction {
  id: number;
  date: string;
  amount: number;
  status: string;
  category: string;
}

export default function Page() {
  const [data, setData] = useState([]); // Store transactions
  const [balance, setBalance] = useState(0); // Store user's balance
  const { user } = useUser(); // Get the user from Clerk
  const { showActionSheetWithOptions } = useActionSheet();

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

  const detailTransactions = (transaction: Transaction) => {
    const options = ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = 1; // Index for "Delete"
    const cancelButtonIndex = 2; // Index for "Cancel"

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (i?: number) => {
        const selectedIndex = i ?? -1; // Default to -1 if undefined
        switch (selectedIndex) {
          case 0: // Edit option
            router.push({
              pathname: "/(root)/add-transaction",
              params: {
                id: transaction.id,
                date: transaction.date,
                amount: transaction.amount,
                status: transaction.status,
                category: transaction.category,
              },
            });
            break;
          case 1: // Delete option
            console.log(`Delete transaction ID: ${transaction}`);
            // Implement your delete logic here
            break;
        }
      }
    );
  };

  // Load balance and transactions when the component mounts
  useEffect(() => {
    if (user?.id) {
      getTransactions(user.id);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        getTransactions(user.id);
      }
    }, [user])
  );

  // Function to group transactions by date
  const groupTransactionsByDate = (transactions: any) => {
    if (!transactions || transactions.length === 0) {
      return []; // Return an empty array if there are no transactions
    }
    const grouped = transactions.reduce((groups, transaction) => {
      const date = transaction.date.split("T")[0]; // Assuming date is in ISO format
      if (!groups[date]) {
        groups[date] = { date, transactions: [], totalAmount: 0 };
      }
      groups[date].transactions.push(transaction);
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
                // Navigate to add transaction page
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
          renderItem={({ item }) => (
            <TransactionCard
              group={item}
              onPress={(transactionId) => detailTransactions(transactionId)} // Pass transaction ID to detail function
            />
          )}
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
