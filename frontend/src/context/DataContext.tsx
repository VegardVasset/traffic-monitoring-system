"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

export interface BaseEvent {
    id: number;
    creationTime: string;
    receptionTime: string;
    vehicleType: string;
    camera: string;
}

interface DataContextProps {
    data: BaseEvent[];
    loading: boolean;
    error: string | null;
    isLive: boolean;
    setIsLive: (live: boolean) => void;
    refetch: () => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

interface DataProviderProps {
    apiUrl: string;
    domain: string;
    children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({
    apiUrl,
    domain,
    children,
}) => {
    const [data, setData] = useState<BaseEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState<boolean>(false);

    const [socket, setSocket] = useState<Socket | null>(null);

    // Function to fetch data via REST
    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch data");
            const jsonData = await res.json();
            setData(jsonData);
            setError(null);
        } catch (err: any) {
            console.error(`Error fetching data for ${domain}:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, domain]);

    // When live mode is off, fetch via REST
    // When live mode is off, fetch via REST only if no data is present
    useEffect(() => {
        if (!isLive && data.length === 0) {
            refetch();
        }
    }, [isLive, refetch, data.length]);


    // When live mode is on, connect to Socket.IO for live updates
    useEffect(() => {
        if (!isLive) {
            // If switching from live to non-live, disconnect any existing socket.
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Create a new socket connection
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            transports: ["websocket", "polling"],
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log(`Connected to WebSocket for ${domain}`);
            newSocket.emit("requestData", domain);
        });

        newSocket.on("initialData", (initialData: BaseEvent[]) => {
            setData(initialData);
            setLoading(false);
            setError(null);
        });

        newSocket.on("newData", (newData: BaseEvent) => {
            // Prepend the new record (you can also merge/update as needed)
            setData((prev) => [newData, ...prev]);
        });

        newSocket.on("error", (err: any) => {
            console.error("Socket error:", err);
            setError(err.message || "Socket error");
        });

        // Cleanup: disconnect the socket when live mode turns off or on unmount
        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [isLive, domain]); // note: we do not include `socket` here to avoid re-running

    return (
        <DataContext.Provider
            value={{ data, loading, error, isLive, setIsLive, refetch }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextProps => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
