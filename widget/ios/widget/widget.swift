import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Storage Manager
struct ShareDataManager {
  static let shared = ShareDataManager()
  private let appGroupID = "group.com.learn.counterwidget"
  
  private var containerURL: URL? {
    FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID)
  }
  
  private var fileURL: URL? {
    containerURL?.appendingPathComponent("data.json")
  }
  
  struct CountData: Codable {
    var count: Int
    var updatedAt: String
    
    var date: Date? {
      ISO8601DateFormatter().date(from: updatedAt)
    }
  }
  
  func readCountData() -> CountData? {
    guard let fileURL = fileURL else { return nil }
    
    do {
      let data = try Data(contentsOf: fileURL)
      let decoder = JSONDecoder()
      return try decoder.decode(CountData.self, from: data)
    } catch {
      print("🚨 Error reading count data: \(error)")
      return nil
    }
  }
  
  func updateCount(delta: Int) {
    guard let fileURL = fileURL else { return }
    
    do {
      var currentData = readCountData() ?? CountData(count: 0, updatedAt: ISO8601DateFormatter().string(from: Date()))
      
      // Prevent negative counts
      let newCount = max(0, currentData.count + delta)
      currentData.count = newCount
      currentData.updatedAt = ISO8601DateFormatter().string(from: Date())
      
      let encoder = JSONEncoder()
      let data = try encoder.encode(currentData)
      try data.write(to: fileURL)
      
      WidgetCenter.shared.reloadAllTimelines()
    } catch {
      print("🚨 Error updating count: \(error)")
    }
  }
}

// MARK: - Provider
struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> CountEntry {
    CountEntry(updatedAt: Date(), count: "0")
  }
  
  func getSnapshot(in context: Context, completion: @escaping (CountEntry) -> ()) {
    let entry = CountEntry(updatedAt: Date(), count: "32")
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<CountEntry>) -> ()) {
    let countData = ShareDataManager.shared.readCountData()
    
    let entry = CountEntry(
      updatedAt: countData?.date,
      count: countData?.count.description ?? "📁 File not found"
    )
    
    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: Date())!
    let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
    completion(timeline)
  }
}

// MARK: - Entry
struct CountEntry: TimelineEntry {
  let date: Date = Date()
  let updatedAt: Date?
  let count: String
}

// MARK: - Widget View
struct WidgetEntryView : View {
  var entry: Provider.Entry
  
  @Environment(\.widgetFamily) var widgetFamily
  
  var body: some View {
    switch widgetFamily {
    case .systemSmall, .systemMedium, .systemLarge:
      HStack(spacing: 8) {
        VStack(spacing: 10) {
          Text(entry.count)
            .font(.system(size: 54, weight: .bold))
            .multilineTextAlignment(.center)
            .minimumScaleFactor(0.5)
          
          if let updatedAt = entry.updatedAt {
            Text("Updated \(updatedAt, style: .relative) ago")
              .font(.caption)
              .multilineTextAlignment(.center)
              .foregroundColor(.gray)
          }
        }
        
        // show buttons only for medium and large widget sizes
        if widgetFamily == .systemMedium || widgetFamily == .systemLarge {
          VStack(spacing: 10) {
            if #available(iOS 17.0, *) {
              Spacer()
              Button(intent: DecrementCountIntent()) {
                Text("-")
                  .font(.system(size: 32, weight: .bold))
                  .frame(width: 54, height: 54)
                  .foregroundColor(Color.white)
                  .background(Color.blue)
                  .clipShape(Circle())
              }
              .buttonStyle(PlainButtonStyle())
              Button(intent: IncrementCountIntent()) {
                Text("+")
                  .font(.system(size: 32, weight: .bold))
                  .frame(width: 54, height: 54)
                  .foregroundColor(Color.white)
                  .background(Color.blue)
                  .clipShape(Circle())
              }
              .buttonStyle(PlainButtonStyle())
              Spacer()
            } else {
              // Fallback for older iOS versions using deeplinks
            }
          }
        }
      }
      .padding()
      .widgetBackground(backgroundView: Color.white)
    case .accessoryRectangular:
      if #available(iOSApplicationExtension 16.0, *) {
        // Lock screen widget layout
        VStack(alignment: .leading) {
          Text("\(entry.count)")
            .font(.headline)
          if let updatedAt = entry.updatedAt {
            Text("Updated \(updatedAt, style: .relative) ago")
              .font(.caption2)
              .foregroundColor(.gray)
          }
        }
        .widgetBackground(backgroundView: Color.white)
      } else {
        EmptyView()
      }
    default:
      EmptyView()
    }
  }
}

// MARK: - intents
@available(iOS 17.0, *)
struct IncrementCountIntent: AppIntent {
  static var title: LocalizedStringResource = "Increment Count"
  
  func perform() -> some IntentResult {
    ShareDataManager.shared.updateCount(delta: 1)
    return .result()
  }
}

@available(iOS 17.0, *)
struct DecrementCountIntent: AppIntent {
  static var title: LocalizedStringResource = "Decrement Count"
  
  func perform() -> some IntentResult {
    ShareDataManager.shared.updateCount(delta: -1)
    return .result()
  }
}

// https://nemecek.be/blog/192/hotfixing-widgets-for-ios-17-containerbackground-padding
extension View {
  func widgetBackground(backgroundView: some View) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      return containerBackground(for: .widget) {
        backgroundView
      }
    } else {
      return background(backgroundView)
    }
  }
}

// MARK: - Main Widget Configuration
@main
struct CounterWidget: Widget {
  let kind: String = "CounterWidget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(
      kind: kind,
      provider: Provider()
    ) { entry in
      WidgetEntryView(entry: entry)
    }
    .supportedFamilies(supportedFamilies)
    .configurationDisplayName("Count Widget")
    .description("This widget displays a count and allows incrementing or decrementing it.")
  }
  
  var supportedFamilies: [WidgetFamily] {
    var families: [WidgetFamily] = [.systemSmall, .systemMedium, .systemLarge]
    if #available(iOSApplicationExtension 16.0, *) {
      families.append(.accessoryRectangular)
    }
    return families
  }
}

// MARK: - Preview
struct CounterWidget_Previews: PreviewProvider {
  static var previews: some View {
    Group {
      WidgetEntryView(entry: CountEntry(updatedAt: Date(), count: "32"))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
      WidgetEntryView(entry: CountEntry(updatedAt: Date(), count: "32"))
        .previewContext(WidgetPreviewContext(family: .systemMedium))
      WidgetEntryView(entry: CountEntry(updatedAt: Date(), count: "32"))
        .previewContext(WidgetPreviewContext(family: .systemLarge))
      if #available(iOS 16.0, *) {
        WidgetEntryView(entry: CountEntry(updatedAt: Date(), count: "32"))
          .previewContext(WidgetPreviewContext(family: .accessoryRectangular))
      }
    }
  }
}
