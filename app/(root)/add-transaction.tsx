import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import DateTimePickerModal

const AddTransaction = () => {
  const transaction = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility
  const { user } = useUser(); // Get the user from Clerk
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: new Date(),
    status: "",
  });

  const transactionId = Array.isArray(transaction.id)
        ? transaction.id[0]
        : transaction.id;

  useEffect(() => {
    if (transaction.id) {
      const amountValue = Array.isArray(transaction.amount)
        ? transaction.amount[0]
        : transaction.amount;

      const categoryValue = Array.isArray(transaction.category)
        ? transaction.category[0]
        : transaction.category;

      const dateValue = Array.isArray(transaction.date)
        ? new Date(transaction.date[0])
        : new Date(transaction.date);

      const statusValue = Array.isArray(transaction.status)
        ? transaction.status[0]
        : transaction.status;

      const newForm = {
        amount: amountValue || "",
        category: categoryValue || "",
        date: dateValue || new Date(),
        status: statusValue || "",
      };
      console.log("test");
      // Only update if the form has actually changed
      if (JSON.stringify(newForm) !== JSON.stringify(form)) {
        setForm(newForm);
        setIsEditing(true);
      }
    } else if (isEditing) {
      // Only reset if we were previously editing
      setForm({
        amount: "",
        category: "",
        date: new Date(),
        status: "",
      });
    }
  }, [transaction.id]); // Add transaction as a dependency 

  const addTransaction = async () => {
    try {
      await fetchAPI("/(api)/transaction", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          date: form.date,
          category: form.category,
          amount: form.amount,
          status: form.status,
        }),
      });
      // Refetch the transactions after adding a new one
    } catch (error) {
      console.error(error);
    }
  };

  const editTransaction = async (id: string) => {
    try {
      await fetchAPI(`/(api)/transaction/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          user_id: user?.id,
          date: form.date,
          category: form.category,
          amount: form.amount,
          status: form.status,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Handle DatePicker confirmation
  const handleConfirm = (selectedDate: any) => {
    setShowDatePicker(false); // Close DateTimePickerModal
    // Convert selected date to GMT+8
    const gmtPlus8Date = new Date(selectedDate.getTime() + 8 * 60 * 60 * 1000); // Adjust to GMT+8
    setForm({ ...form, date: gmtPlus8Date }); // Set selected date in form
  };

  return (
    <SafeAreaView className="bg-tertiary flex-1">
      <View className="flex-1">
        <View className="flex flex-col">
          {/* Container for back arrow and title */}
          <View className="flex flex-row px-5 pt-2 w-full items-center">
            {/* Back arrow on the left */}
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={icons.backArrow}
                resizeMode="contain"
                tintColor={"white"}
                className="w-6 h-6"
              />
            </TouchableOpacity>

            {/* Absolute center text */}
            <Text className="text-base absolute left-[42%] transform -translate-x-1/2 text-white font-JakartaBold pt-1">
              Transaction
            </Text>
          </View>
          <View className="mt-5">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className=" rounded-2xl min-h-[300px]"
            >
              <InputField
                label=""
                placeholder="Amount"
                value={form.amount}
                onChangeText={(value) => {
                  const numericValue = parseFloat(value); // Convert the input to a number
                  setForm({
                    ...form,
                    amount: value,
                    status: numericValue < 0 ? "out" : "in", // Set status based on the amount
                  });
                }}
                keyboardType="numeric"
              />

              <InputField
                label=""
                placeholder="Category"
                value={form.category}
                onChangeText={(value) => setForm({ ...form, category: value })}
              />

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

              <DateTimePickerModal
                isVisible={showDatePicker} // Show DateTimePickerModal when triggered
                mode="date" // Date mode only
                date={form.date ? new Date(form.date) : new Date()} // Default date in picker
                onConfirm={handleConfirm} // Handle confirmed date
                onCancel={() => setShowDatePicker(false)} // Close DateTimePickerModal on cancel
              />

              <CustomButton
                title={isEditing ? "Update" : "Done"}
                onPress={() => {
                  isEditing ? editTransaction(transactionId) : addTransaction();
                  setForm({
                    amount: "0",
                    category: "",
                    date: new Date(),
                    status: "",
                  }); 
                  router.back(); 
                  setIsEditing(false);
                }}
                className="mt-2 bg-success-500 mb-5"
              />
            </KeyboardAvoidingView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddTransaction;
