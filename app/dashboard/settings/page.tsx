export default function SettingsPage() {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-muted-foreground">Update your account preferences and profile details.</p>
        
        <div className="mt-8 border border-destructive/20 bg-destructive/5 p-4 rounded-lg">
             <h3 className="font-semibold text-destructive">Danger Zone</h3>
             <p className="text-sm text-foreground/60 mb-4">Permanently delete your account and all data.</p>
             <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm disabled:opacity-50">Delete Account</button>
        </div>
      </div>
    )
  }
