const EmptyState = ({ message }: { message: string }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="text-sm">{message}</span>
        </div>
    );
};

export default EmptyState;