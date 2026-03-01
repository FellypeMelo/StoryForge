pub trait DatabasePort {
    fn is_healthy(&self) -> bool;
}
