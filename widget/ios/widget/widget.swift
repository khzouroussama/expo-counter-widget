import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> CountEntry {
    CountEntry(date: Date(), count: 0)
  }
  
  func getSnapshot(in context: Context, completion: @escaping (CountEntry) -> ()) {
    let entry = CountEntry(date: Date(), count: 32)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    let appGroupID = "group.com.learn.counterwidget"
    if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) {
      let fileURL = containerURL.appendingPathComponent("data.json")
      do {
        let data = try Data(contentsOf: fileURL)
        if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
          // Extract count
          let count = json["count"] as? Int ?? 0
          
          // Extract updatedAtString
          let updatedAtString = json["updatedAt"] as? String ?? ""
          print("updatedAtString: \(updatedAtString)")
          
          let dateFormatter = ISO8601DateFormatter()
          
          // Parse updatedAt date
          let updatedAt = dateFormatter.date(from: updatedAtString) ?? Date()
          
          // Create entry
          let entry = CountEntry(date: updatedAt, count: count)
          let timeline = Timeline(entries: [entry], policy: .atEnd)
          completion(timeline)
          return
        } else {
          print("JSON parsing failed")
        }
      } catch {
        print("Error reading file: \(error)")
      }
    }
    
    // Fallback entry
    let entry = CountEntry(date: Date(), count: 0)
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
}

struct CountEntry: TimelineEntry {
  let date: Date
  let count: Int
}

struct widgetEntryView : View {
  var entry: Provider.Entry
  
  var body: some View {
    VStack {
      Text("Count: \(entry.count)")
        .font(.headline)
      Text("Updated at:")
        .font(.subheadline)
      Text(entry.date, style: .time)
        .font(.footnote)
    }
  }
}

@main
struct widget: Widget {
  let kind: String = "widget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      widgetEntryView(entry: entry)
    }
    .configurationDisplayName("Count Widget")
    .description("This is an example widget.")
  }
}

struct widget_Previews: PreviewProvider {
  static var previews: some View {
    widgetEntryView(entry: CountEntry(date: Date(), count: 32))
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
