import ExpoModulesCore
import ActivityKit
import WidgetKit

public class WidgetModule: Module {
    private var appGroupID: String? {
        if let bundleID = Bundle.main.bundleIdentifier {
            return "group.\(bundleID)"
        }
        return nil
    }
    
    private func getAppGroupContainerURL() -> URL? {
        guard let appGroupID = self.appGroupID else {
            print("Error: Unable to obtain app group ID.")
            return nil
        }
        return FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID)
    }
    
    public func definition() -> ModuleDefinition {
        Name("Widget")
        
        Function("getContainerUrl") { () -> String? in
            if let containerURL = self.getAppGroupContainerURL() {
                return containerURL.absoluteString
            } else {
                return nil
            }
        }
        
        AsyncFunction("writeAsStringAsync") { (fileUrl: URL, content: String) in
            do {
                try content.write(to: fileUrl, atomically: true, encoding: .utf8)
            } catch {
                print("Error writing file: \(error)")
            }
        }
        
        Function("readAsStringAsync") { (fileUrl: URL) -> String? in
            do {
                let content = try String(contentsOf: fileUrl, encoding: .utf8)
                return content
            } catch let error as NSError {
                if error.domain == NSCocoaErrorDomain && error.code == NSFileReadNoSuchFileError {
                    throw Exception(
                        name: "FILE_NOT_FOUND",
                        description: "File not found",
                        code: "FILE_NOT_FOUND"
                    )
                } else {
                    print("Error reading file: \(error)")
                    return nil
                }
            }
        }
        
        Function("reloadWidgets") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
