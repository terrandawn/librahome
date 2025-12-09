import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Sign Out</h1>
        <p className="text-gray-600 mb-8">
          Are you sure you want to sign out of LibraHome?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-[#7C3AED] px-4 py-3 text-base font-medium text-white transition-colors hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;
