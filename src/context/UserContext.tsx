import React, { createContext, useState, useContext } from "react";

interface UserContextType {
  user: UserData | null;
  setUser: (data: UserData) => void;
}

interface UserData {
  id: number;
  name: string;
  avatar: string;
  groupId: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 🔵 כאן ההחלפה — ה־UserProvider עם לוגים
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);

  const wrappedSetUser = (data: UserData) => {
    console.log("🟦 UserProvider קיבל setUser עם:", data);
    setUser(data);
  };

  return (
    <UserContext.Provider value={{ user, setUser: wrappedSetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
