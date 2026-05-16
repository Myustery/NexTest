//! 同步引擎测试

use crate::sync::{ConflictResolver, ConflictStrategy, ConflictType, SyncQueue};
use crate::models::{SyncEvent, SyncEventType, SyncEntityType};
use chrono::Utc;
use serde_json::json;
use uuid::Uuid;

#[test]
fn test_sync_queue_enqueue_dequeue() {
    let queue = SyncQueue::new(100);
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();

    let event = SyncEvent::new(
        user_id,
        "device-001".to_string(),
        SyncEventType::Create,
        SyncEntityType::Session,
        entity_id,
        json!({ "name": "test" }),
        1,
    );

    queue.enqueue(event.clone()).unwrap();
    assert_eq!(queue.len(), 1);

    let dequeued = queue.dequeue().unwrap();
    assert_eq!(dequeued.id, event.id);
    assert!(queue.is_empty());
}

#[test]
fn test_sync_queue_max_size() {
    let queue = SyncQueue::new(2);
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();

    let event = SyncEvent::new(
        user_id,
        "device-001".to_string(),
        SyncEventType::Create,
        SyncEntityType::Session,
        entity_id,
        json!({}),
        1,
    );

    queue.enqueue(event.clone()).unwrap();
    queue.enqueue(event.clone()).unwrap();

    // 队列已满，应该失败
    assert!(queue.enqueue(event).is_err());
}

#[test]
fn test_sync_queue_batch_operations() {
    let queue = SyncQueue::new(100);
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();

    let event = SyncEvent::new(
        user_id,
        "device-001".to_string(),
        SyncEventType::Create,
        SyncEntityType::Session,
        entity_id,
        json!({}),
        1,
    );

    let events = vec![event.clone(), event.clone(), event.clone()];
    let count = queue.enqueue_batch(events).unwrap();
    assert_eq!(count, 3);
    assert_eq!(queue.len(), 3);

    let batch = queue.dequeue_batch(2);
    assert_eq!(batch.len(), 2);
    assert_eq!(queue.len(), 1);
}

#[test]
fn test_conflict_resolver_detect() {
    let resolver = ConflictResolver::new(ConflictStrategy::LatestWins);
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();

    let local_event = SyncEvent::new(
        user_id,
        "device-001".to_string(),
        SyncEventType::Update,
        SyncEntityType::Session,
        entity_id,
        json!({ "name": "local" }),
        2,
    );

    let remote_event = SyncEvent::new(
        user_id,
        "device-002".to_string(),
        SyncEventType::Update,
        SyncEntityType::Session,
        entity_id,
        json!({ "name": "remote" }),
        1,
    );

    let conflicts = resolver.detect_conflicts(&[local_event], &[remote_event]);

    // 版本不同，应该检测到冲突
    assert_eq!(conflicts.len(), 1);
    assert_eq!(conflicts[0].conflict_type, ConflictType::VersionConflict);
}

#[test]
fn test_conflict_resolver_resolve_latest_wins() {
    let resolver = ConflictResolver::new(ConflictStrategy::LatestWins);
    let user_id = Uuid::new_v4();
    let entity_id = Uuid::new_v4();
    let now = Utc::now();

    let local_event = SyncEvent {
        id: Uuid::new_v4(),
        user_id,
        device_id: "device-001".to_string(),
        event_type: SyncEventType::Update,
        entity_type: SyncEntityType::Session,
        entity_id,
        payload: json!({ "name": "local" }),
        version: 2,
        timestamp: now,
    };

    let remote_event = SyncEvent {
        id: Uuid::new_v4(),
        user_id,
        device_id: "device-002".to_string(),
        event_type: SyncEventType::Update,
        entity_type: SyncEntityType::Session,
        entity_id,
        payload: json!({ "name": "remote" }),
        version: 1,
        timestamp: now - chrono::Duration::seconds(10),
    };

    use crate::sync::SyncConflict;
    let conflict = SyncConflict {
        conflict_type: ConflictType::UpdateConflict,
        local_event,
        remote_event,
    };

    let resolved = resolver.resolve(&conflict, None).unwrap();

    // LatestWins 策略应该选择时间戳更新的本地事件
    assert_eq!(resolved.payload["name"], "local");
}