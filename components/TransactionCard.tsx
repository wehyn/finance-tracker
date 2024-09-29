import { View, Text } from "react-native";

interface Transaction {
  transaction_id: number;
  date: string;
  amount: number;
  status: string;
  category: string;
}

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const { category, date, amount, status } = transaction; // Destructure properties

  return (
    <View className="bg-[#27292e] rounded-xl p-4 mt-3">
      <View className="flex flex-row justify-between">
        <View>
          <Text className="text-white font-JakartaBold">{category}</Text>
          <Text className="text-white mt-2">{date}</Text>
        </View>
        <View className="items-end justify-center">
          <Text className={`${status === "in" ? "text-general-400" : "text-red-500"}`}>₱{amount}</Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionCard;
