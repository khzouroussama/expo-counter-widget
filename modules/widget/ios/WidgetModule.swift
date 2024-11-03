import ExpoModulesCore
import ActivityKit
import WidgetKit

public class WidgetModule: Module {
    public func definition() -> ModuleDefinition {
        Name("Widget")
        
        Function("setData") { (key: String, value: Int, group: String?) -> Void in
            let userDefaults = UserDefaults(
                suiteName: group
            )
            userDefaults?.set(value, forKey: key)
            
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
        
        Function("getData") { (key: String, group: String?) -> Int? in
            let userDefaults = UserDefaults(
                suiteName: group
            )
            return userDefaults?.integer(forKey: key)
        }
        
        Function("getAppGroupContainerUrl") { () -> String? in
            let appGroupID = "group.com.learn.counterwidget" // Replace with your App Group ID
            if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
                return containerURL.absoluteString
            } else {
                return nil
            }
        }
        
        
        Function("writeFile") { (filename: String, content: String) in
            let appGroupID = "group.com.learn.counterwidget" // Replace with your App Group ID
            if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
                let fileURL = containerURL.appendingPathComponent(filename)
                do {
                    try content.write(to: fileURL, atomically: true, encoding: .utf8)
                } catch {
                    print("Error writing file: \(error)")
                }
            }
        }
        
        Function("readFile") { (filename: String) -> String? in
            let appGroupID = "group.com.learn.counterwidget" // Replace with your App Group ID
            if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
                let fileURL = containerURL.appendingPathComponent(filename)
                do {
                    let content = try String(contentsOf: fileURL, encoding: .utf8)
                    return content
                } catch {
                    print("Error reading file: \(error)")
                    return nil
                }
            }
            return nil
        }
        
        Function("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
        
    }
}
