import StockNotification from "@/components/StockNotification";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <StockNotification />
            {children}
        </>
    );
}
