
const UserInfo = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("userprofile",user)
  if (!user) return null;

  const role = user.roles?.[0]?.name || "N/A";

  return (
    <div className="bg-white  rounded-xl p-6 w-full max-w-sm mx-auto text-gray-800">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={user.image_url}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Email:</span>
          <span>{user.email || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Mobile:</span>
          <span>{user.mobile || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Restaurant ID:</span>
          <span>{user.restaurant_id || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Shift ID:</span>
          <span>{user.shift_id || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Last Login:</span>
          <span>{user.last_login_at || "N/A"}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Application Type: {user.application_type || "N/A"}
      </div>
    </div>
  );
};

export default UserInfo;
