pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
    fn get_version(&self) -> i32;
}
