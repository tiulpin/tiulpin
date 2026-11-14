# Select with yadm config local.class mini|workstation.
# Edit .config/yadm/brewfiles/*; do not overwrite this dispatcher with bundle dump.
begin
  profile = IO.popen(["yadm", "config", "--get", "local.class"], err: File::NULL, &:read).strip
rescue Errno::ENOENT
  profile = ""
end
profile = "workstation" if profile.empty?
raise "Unknown yadm profile: #{profile.inspect}" unless %w[workstation mini].include?(profile)

brewfile = File.join(__dir__, ".config/yadm/brewfiles", profile)
instance_eval(File.read(brewfile), brewfile)
