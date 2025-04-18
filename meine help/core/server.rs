use std::{
    collections::{BTreeMap, HashMap, HashSet},
    hash::Hasher,
    sync::{Arc, Mutex},
};

use chrono::{DateTime, Local};
use nohash_hasher::{IntMap, IntSet};
use sf_api::{
    gamestate::unlockables::EquipmentIdent, session::ServerConnection,
};

use crate::{
    crawler::{CrawlAction, CrawlerState, WorkerQue},
    player::AccountInfo,
    AccountID, AccountIdent, CharacterInfo, QueID, ServerID,
};

#[derive(Debug, Clone)]
pub enum CrawlingStatus {
    Waiting,
    Restoring,
    CrawlingFailed(String),
    Crawling {
        que_id: QueID,
        threads: usize,
        que: Arc<Mutex<WorkerQue>>,
        player_info: IntMap<u32, CharacterInfo>,
        equipment: HashMap<
            EquipmentIdent,
            HashSet<u32, ahash::RandomState>,
            ahash::RandomState,
        >,
        naked: BTreeMap<u16, IntSet<u32>>,
        last_update: DateTime<Local>,
        crawling_session: Option<Arc<CrawlerState>>,
        recent_failures: Vec<CrawlAction>,
    },
}

pub struct ServerInfo {
    pub ident: ServerIdent,
    pub accounts: HashMap<AccountID, AccountInfo, ahash::RandomState>,
    pub crawling: CrawlingStatus,
    pub connection: ServerConnection,
    pub headless_progress: Option<indicatif::ProgressBar>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ServerIdent {
    pub id: ServerID,
    pub url: String,
    pub ident: String,
}

impl ServerIdent {
    pub fn new(url: &str) -> Self {
        let url = url.trim_start_matches("https:");
        let url: String = url
            .chars()
            .map(|a| a.to_ascii_lowercase())
            .filter(|a| *a != '/')
            .collect();
        let ident: String =
            url.chars().filter(|a| a.is_alphanumeric()).collect();
        let mut hasher = ahash::AHasher::default();
        hasher.write(ident.as_bytes());
        let id = hasher.finish();
        ServerIdent {
            id: ServerID(id),
            url,
            ident,
        }
    }
}

#[derive(Default)]
pub struct Servers(pub HashMap<ServerID, ServerInfo, ahash::RandomState>);

impl Servers {
    pub fn get_or_insert_default(
        &mut self,
        server_ident: ServerIdent,
        connection: ServerConnection,
        pb: Option<indicatif::ProgressBar>,
    ) -> &mut ServerInfo {
        let server =
            self.0.entry(server_ident.id).or_insert_with(|| ServerInfo {
                ident: server_ident.clone(),
                accounts: Default::default(),
                crawling: CrawlingStatus::Waiting,
                connection,
                headless_progress: pb,
            });
        server
    }

    pub fn get_ident(
        &self,
        ident: &AccountIdent,
    ) -> Option<(&ServerInfo, &AccountInfo)> {
        let server = self.0.get(&ident.server_id)?;
        let account = server.accounts.get(&ident.account)?;
        Some((server, account))
    }

    pub fn get(&self, id: &ServerID) -> Option<&ServerInfo> {
        self.0.get(id)
    }

    pub fn get_mut(&mut self, id: &ServerID) -> Option<&mut ServerInfo> {
        self.0.get_mut(id)
    }
}
