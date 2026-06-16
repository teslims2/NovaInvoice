#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    Funded,
    Repaid,
}

#[contracttype]
#[derive(Clone)]
pub struct InvoiceData {
    pub owner: Address,
    pub face_value: i128,
    pub status: InvoiceStatus,
}

#[contract]
pub struct NovaInvoiceContract;

#[contractimpl]
impl NovaInvoiceContract {
    pub fn submit_invoice(env: Env, owner: Address, invoice_id: String, face_value_usdc: i128) {
        owner.require_auth();
        let data = InvoiceData {
            owner,
            face_value: face_value_usdc,
            status: InvoiceStatus::Pending,
        };
        env.storage().persistent().set(&invoice_id, &data);
    }

    pub fn fund_invoice(env: Env, invoice_id: String) {
        let mut data: InvoiceData = env.storage().persistent().get(&invoice_id).unwrap();
        assert!(data.status == InvoiceStatus::Pending, "invoice not pending");
        data.status = InvoiceStatus::Funded;
        env.storage().persistent().set(&invoice_id, &data);
    }

    pub fn repay_invoice(env: Env, invoice_id: String) {
        let mut data: InvoiceData = env.storage().persistent().get(&invoice_id).unwrap();
        assert!(data.status == InvoiceStatus::Funded, "invoice not funded");
        data.status = InvoiceStatus::Repaid;
        env.storage().persistent().set(&invoice_id, &data);
    }

    pub fn get_invoice(env: Env, invoice_id: String) -> Option<InvoiceData> {
        env.storage().persistent().get(&invoice_id)
    }
}
