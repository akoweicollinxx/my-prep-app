type Props = {
  message?: string;
};

export function LoadingState({ message = 'Analysing…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-purple-300 text-sm font-medium">{message}</p>
    </div>
  );
}
