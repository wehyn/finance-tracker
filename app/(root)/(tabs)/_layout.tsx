import { icons } from "@/constants";
import { Tabs } from "expo-router";
import React from "react";
import { View, Image, ImageSourcePropType } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className={`flex flex-row justify-center items-center rounded-full `}>
    <View className={`rounded-full w-12 h-12 items-center justify-center`}>
      <Image
        source={source}
        tintColor={focused ? "#0cc25f" : "white"}
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
);

const Layout = () => (
  <Tabs
    initialRouteName="index"
    screenOptions={{
      tabBarActiveTintColor: "green",
      tabBarInactiveTintColor: "white",
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "#2a2b2e",
        borderRadius: 50,
        paddingBottom: 0,
        overflow: "hidden",
        marginHorizontal: 20,
        marginBottom: 30,
        height: 73,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        position: "absolute",
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
    }}
  >
    <Tabs.Screen
      name="home"
      options={{
        title: "Home",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} source={icons.home} />
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: "Profile",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} source={icons.profile} />
        ),
      }}
    />
  </Tabs>
);

export default Layout;
