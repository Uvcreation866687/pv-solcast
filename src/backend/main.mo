import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import List "mo:core/List";
import Iter "mo:core/Iter";

actor {
  type PVArrayConfig = {
    name : Text;
    panelCount : Nat;
    panelWattage : Nat;
    tiltAngle : Float;
    azimuthAngle : Float;
    enabled : Bool;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
    cityName : Text;
  };

  type CalibrationSettings = {
    efficiencyMultiplier : Float;
    soilingFactor : Float;
    temperatureCoefficient : Float;
  };

  type SystemConfig = {
    systemName : Text;
    location : Location;
    arrays : [PVArrayConfig];
    calibration : CalibrationSettings;
    electricityPrice : Float;
    co2EmissionFactor : Float;
    unitPreference : Text;
  };

  type NamedPreset = {
    config : SystemConfig;
    timestamp : Time.Time;
  };

  type UserPreferences = {
    preferredTab : Text;
    unitSystem : Text;
  };

  let userConfigs = Map.empty<Principal, SystemConfig>();
  let userPresets = Map.empty<Principal, List.List<(Text, NamedPreset)>>();
  let userPreferences = Map.empty<Principal, UserPreferences>();

  public shared ({ caller }) func saveSystemConfig(config : SystemConfig) : async () {
    validateArrays(config.arrays);
    validateCalibration(config.calibration);
    userConfigs.add(caller, config);
  };

  public query ({ caller }) func getSystemConfig() : async ?SystemConfig {
    userConfigs.get(caller);
  };

  public shared ({ caller }) func savePreset(name : Text, config : SystemConfig) : async () {
    validateArrays(config.arrays);
    validateCalibration(config.calibration);
    let preset : NamedPreset = {
      config;
      timestamp = Time.now();
    };

    let existingPresets = switch (userPresets.get(caller)) {
      case (null) { List.empty<(Text, NamedPreset)>() };
      case (?presets) { presets };
    };

    let filteredPresets = existingPresets.filter(func((presetName, _)) { presetName != name });
    filteredPresets.add((name, preset));
    userPresets.add(caller, filteredPresets);
  };

  public query ({ caller }) func getPresets() : async [(Text, NamedPreset)] {
    switch (userPresets.get(caller)) {
      case (null) { [] };
      case (?presets) { presets.toArray() };
    };
  };

  public shared ({ caller }) func savePreferences(preferences : UserPreferences) : async () {
    userPreferences.add(caller, preferences);
  };

  public query ({ caller }) func getPreferences() : async ?UserPreferences {
    userPreferences.get(caller);
  };

  func validateArrays(arrays : [PVArrayConfig]) {
    if (arrays.size() > 5) {
      Runtime.trap("Maximum of 5 arrays allowed");
    };
  };

  func validateCalibration(cal : CalibrationSettings) {
    if (cal.efficiencyMultiplier < 0.5 or cal.efficiencyMultiplier > 1.5) {
      Runtime.trap("Efficiency multiplier must be between 0.5 and 1.5");
    };
    if (cal.soilingFactor < 0.0 or cal.soilingFactor > 1.0) {
      Runtime.trap("Soiling factor must be between 0.0 and 1.0");
    };
  };

  public query ({ caller }) func getUserConfig(user : Principal) : async ?SystemConfig {
    userConfigs.get(user);
  };

  public query ({ caller }) func getUserPresets(user : Principal) : async [(Text, NamedPreset)] {
    switch (userPresets.get(user)) {
      case (null) { [] };
      case (?presets) { presets.toArray() };
    };
  };
};
