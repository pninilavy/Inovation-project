// import React, { createContext, useState, useContext } from "react";

// interface UserData {
//   name: string;
//   avatar: string;
// }

// interface UserContextType {
//   user: UserData | null;
//   setUser: (data: UserData) => void;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<UserData | null>(null);
//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const ctx = useContext(UserContext);
//   if (!ctx) throw new Error("useUser must be used within UserProvider");
//   return ctx;
// };
// src/context/UserContext.tsx
import React, { createContext, useState, useContext } from "react";

// interface UserData {
//   name: string;
//   avatar: string;
//   groupId?: number;
//   groupName?: string;
// }

interface UserContextType {
  user: UserData | null;
  setUser: (data: UserData) => void;
}
interface UserData {
  name: string;
  avatar: string;
  groupId: number; // ← חדש
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
