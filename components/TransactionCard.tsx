import { formatDate } from "@/lib/utils";
import { View, Text, TouchableOpacity } from "react-native";

interface Transaction {
  id: number;
  date: string;
  amount: number;
  status: string;
  category: string;
}

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
  totalAmount: number;
}

const TransactionCard = ({ group, onPress }: { group: TransactionGroup, onPress: (transaction: Transaction) => void}) => {
  const { date, transactions } = group;

  return (
    <View className="bg-[#27292e] rounded-xl p-4 mt-3">
      {/* Display Date and Total Amount for the Day */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View>
            <Text className="text-gray-400 font-JakartaSemiBold">{formatDate(date)}</Text>
          </View>
        </View>
      </View>

      {/* Render Each Transaction */}
      {transactions.map((transaction) => (
        <TouchableOpacity onPress={() => onPress(transaction)}>
          <View
            key={transaction.id}
            className="flex-row justify-between items-center mb-2"
          >
            <View className="flex-row items-center">
              <Text className="text-white capitalize font-Jakarta">
                {transaction.category}
              </Text>
            </View>
            <Text
              className={`${
                transaction.status === "in"
                  ? "text-general-400"
                  : "text-red-500"
              }`}
            >
              ₱{transaction.amount}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TransactionCard;
