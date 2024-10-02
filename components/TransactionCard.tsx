import { formatDate } from "@/lib/utils";
import { View, Text, Image, TouchableOpacity } from "react-native";

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

const TransactionCard = ({ group, onPress }: { group: TransactionGroup, onPress: (id: number) => void}) => {
  const { date, transactions } = group;
  console.log(group);

  return (
    <View className="bg-[#27292e] rounded-xl p-4 mt-3">
      {/* Display Date and Total Amount for the Day */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View>
            <Text className="text-gray-400">{formatDate(date)}</Text>
          </View>
        </View>
      </View>

      {/* Render Each Transaction */}
      {transactions.map((transaction) => (
        <TouchableOpacity onPress={() => onPress(transaction.id)}>
          <View
            key={transaction.id}
            className="flex-row justify-between items-center mb-2"
          >
            <View className="flex-row items-center">
              <Text className="text-white capitalize font-JakartaBold">
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
